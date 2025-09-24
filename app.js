// ===================================================================
// CONFIGURAÇÕES GLOBAIS
// ===================================================================

// URLs dos arquivos de dados (JSON)
const PROJETOS_URL = "projetos/projetos.json";
const SKILLS_URL = "skills.json";

// Define quantos projetos (além do "novo") aparecerão na vitrine da home.
const TOP_PROJETOS = 7; 

// Objeto global (dicionario) para as skills. Evita carregar o JSON várias vezes.
let skillsMap = {}; 

// ===================================================================
// 1. CARREGAMENTO DOS DADOS (JSON)
// ===================================================================

/**
 * Carrega a lista de projetos do arquivo projetos.json e mescla com os cliques locais.
 * Retorna Uma lista com todos os objetos de projeto.
 */
async function loadProjetos() {
  const res = await fetch(PROJETOS_URL, { cache: "no-store" });
  const data = await res.json();
  const mapaCliquesLocal = getCliquesMap();

  data.projetos.forEach(p => {
    if (mapaCliquesLocal[p.id] != null) p.cliques = mapaCliquesLocal[p.id];
  });
  return data.projetos;
}

/**
 * Carrega o mapa de skills do arquivo skills.json. Usa o objeto global se já foi carregado.
 * Retorna Um objeto (dicionário) com todas as skills.
 */
async function loadSkills() {
  if (Object.keys(skillsMap).length > 0) return skillsMap;
  const res = await fetch(SKILLS_URL, { cache: "no-store" });
  skillsMap = await res.json();
  return skillsMap;
}

// ===================================================================
// 2. LÓGICA DA VITRINE DE DESTAQUES
// ===================================================================

/**
 * Seleciona os projetos que aparecerão na vitrine da página inicial. 
 * Utiliza lista completa de projetos como parametro.
 * Retorna uma lista contendo o projeto "novo" e os mais clicados.
 */
function pickDestaques(list) {
  const novo = list.find(p => p.novo);
  const restantes = list
    .filter(p => !p.novo) 
    .sort((a, b) => (b.cliques || 0) - (a.cliques || 0)) 
    .slice(0, TOP_PROJETOS);

  return novo ? [novo, ...restantes] : restantes;
}

// ===================================================================
// 3. CRIAÇÃO DO HTML DOS CARDS
// ===================================================================

/**
 * Cria um único card de projeto.
 * Utiliza do projeto e do mapa de skills como parametro.
 * Retorna o código HTML do card.
 */
function projetoCardHTML(p, skills) {
  let skillChipsHTML = (p.skill || []).map(s => {
    const data = skills[s] || { icon: "fa-solid fa-tag", color: "#555" };
    return `<span class="skill-chip" style="background:${data.color}20; color:${data.color}">
              <i class="${data.icon}"></i> ${s}
            </span>`;
  }).join("");

  if (p.novo) {
    const novoChip = `<span class="skill-chip tag-novo">
                        <i class="fa-solid fa-star"></i> NOVO
                      </span>`;
    skillChipsHTML = novoChip + " " + skillChipsHTML;
  }

  return `
    <div class="card-spotlight ${p.novo ? "card-novo" : ""}">
      <div class="card-spotlight-head">
        <h3>${p.nome}</h3>
      </div>
      <p class="desc">${p.descricao}</p>
      <div class="skills-line">${skillChipsHTML}</div>
      <a href="projetos/${p.link}" class="saiba-mais" data-id="${p.id}">Saiba mais…</a>
    </div>
  `;
}

// ===================================================================
// 4. RENDERIZAÇÃO NAS PÁGINAS
// ===================================================================

/**
 * Renderiza os cards de destaque na página inicial.
 */
async function renderHome() {
  const container = document.getElementById("projetos-home");
  if (!container) return; 

  const [projetos, skills] = await Promise.all([loadProjetos(), loadSkills()]);
  const destaques = pickDestaques(projetos);

  container.innerHTML = destaques.map(p => projetoCardHTML(p, skills)).join("");
}

/**
 * Renderiza todos os cards de projeto na página de atividades.
 */
async function renderAtividades() {
  const container = document.getElementById("projetos-atividades");
  if (!container) return; 

  const [projetos, skills] = await Promise.all([loadProjetos(), loadSkills()]);
  projetos.sort((a, b) => a.nome.localeCompare(b.nome)); 

  container.innerHTML = projetos.map(p => projetoCardHTML(p, skills)).join("");
}

// ===================================================================
// 5. CONTROLE DE CLIQUES (Futura conexão com PHP)
// ===================================================================

// Chave para salvar os cliques no armazenamento local do navegador
const CLIQUES_KEY = "projetosCliques_v1";

function getCliquesMap() {
  try {
    return JSON.parse(localStorage.getItem(CLIQUES_KEY)) || {};
  } catch {
    return {};
  }
}

function setCliquesMap(map) {
  localStorage.setItem(CLIQUES_KEY, JSON.stringify(map));
}

function contarClique(id) {
  if (window.location.hostname === "localhost") { // Caso esteja na minha máquina
    
    console.log("Ambiente local detectado. Enviando clique para o PHP...");
    const url = `http://localhost/Site_Thadeu/api.php?id=${id}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("Resposta do servidor PHP:", data.mensagem);
      })
      .catch(error => {
        console.error("Erro ao contatar o servidor local:", error);
      });

  } else { // Caso esteja no GitHub Pages 
    console.log("Ambiente online detectado. Usando localStorage.");
    const mapa = getCliquesMap();
    mapa[id] = (mapa[id] || 0) + 1;
    setCliquesMap(mapa);
  }
}

function bindCliqueTracking() {
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a.saiba-mais[data-id]');
    if (!a) return;
    
    const id = a.dataset.id;
    if (id) {
      contarClique(id);
    }
  }, { capture: true });
}

// ===================================================================
// 6. INICIALIZAÇÃO DO SCRIPT (Init)
// ===================================================================

// Espera o carregamento do domínio antes de iniciar as funções de renderização.
document.addEventListener("DOMContentLoaded", () => {
  bindCliqueTracking();
  renderHome();
  renderAtividades();
});