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
 * Carrega a lista de projetos do arquivo projetos.json e mescla com os cliques do banco de dados.
 * Retorna Uma lista com todos os objetos de projeto.
 */
async function loadProjetos() {
  const projetosRes = await fetch(PROJETOS_URL, { cache: "no-store" });
  const dataProjetos = await projetosRes.json();

  const cliquesRes = await fetch('https://portfolio-ten-azure-17.vercel.app/api/get-cliques');
  const mapaDeCliques = await cliquesRes.json();

  dataProjetos.projetos.forEach(p => {
    if (mapaDeCliques[p.id] != null) {
      p.cliques = mapaDeCliques[p.id];
    }
  });

  return dataProjetos.projetos;
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
// 5. CONTROLE DE CLIQUES (Conexão com Banco de Dados)
// ===================================================================

function contarClique(id) {
  console.log(`Enviando clique para o projeto: ${id}`);
  
  const url = `https://portfolio-ten-azure-17.vercel.app/api/clique?id=${id}`;

  fetch(url, { method: 'GET', keepalive: true })
    .then(response => {
      if (response.ok) {
        console.log("Clique registrado com sucesso pela API.");
      }
    })
    .catch(error => {
      console.error("Erro ao contatar a API Vercel:", error);
    });
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
  
   if (document.getElementById("current-year")) {
    document.getElementById("current-year").textContent = new Date().getFullYear();
  }
});
