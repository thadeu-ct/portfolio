// ==============================
// CONFIGURAÇÕES GLOBAIS
// ==============================
const PROJETOS_URL = "projetos/projetos.json";
const SKILLS_URL = "skills.json";
const TOP_PROJETOS = 7; 

let skillsMap = {}; 

// ==============================
// CARREGAMENTO DOS DADOS (JSON)
// ==============================
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

async function loadSkills() {
  if (Object.keys(skillsMap).length > 0) return skillsMap;
  const res = await fetch(SKILLS_URL, { cache: "no-store" });
  skillsMap = await res.json();
  return skillsMap;
}

// ==============================
// LÓGICA DA VITRINE DE DESTAQUES
// ==============================
function pickDestaques(list) {
  const novo = list.find(p => p.novo);
  const restantes = list
    .filter(p => !p.novo) 
    .sort((a, b) => (b.cliques || 0) - (a.cliques || 0)) 
    .slice(0, TOP_PROJETOS);

  return novo ? [novo, ...restantes] : restantes;
}

// ==============================
// CRIAÇÃO DO HTML DOS CARDS
// ==============================
function projetoCardHTML(p, skills) {
  let skillChipsHTML = (p.skill || []).map(s => {
    const data = skills[s] || { icon: "fa-solid fa-tag", color: "#555" };
    const textColor = data.color === '#000000' ? '#FFFFFF' : data.color;
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

// ==============================
// RENDERIZAÇÃO NAS PÁGINAS
// ==============================
async function carregaComponente({id, componente}) {
    const arq = await fetch(componente);
    const html = await arq.text();
    document.getElementById(id).innerHTML = html;
    return true; 
}

async function renderHome() {
  const container = document.getElementById("projetos-home");
  if (!container) return; 

  const [projetos, skills] = await Promise.all([loadProjetos(), loadSkills()]);
  const destaques = pickDestaques(projetos);

  container.innerHTML = destaques.map(p => projetoCardHTML(p, skills)).join("");
}

async function renderAtividades() {
  const container = document.getElementById("projetos-atividades");
  if (!container) return; 

  const [projetos, skills] = await Promise.all([loadProjetos(), loadSkills()]);
  projetos.sort((a, b) => a.nome.localeCompare(b.nome)); 

  container.innerHTML = projetos.map(p => projetoCardHTML(p, skills)).join("");
}

async function corrigirCaminhosParaLocalhost() {
  if (window.location.hostname !== '127.0.0.1' && window.location.hostname !== 'localhost') {
    return;
  }

  console.log("Ambiente local detectado. Corrigindo caminhos...");

  const prefixo = '/portfolio';
  
  const elementos = document.querySelectorAll(`a[href^="${prefixo}"], img[src^="${prefixo}"]`);

  elementos.forEach(el => {
    if (el.hasAttribute('href')) {
      const caminhoAntigo = el.getAttribute('href');
      const caminhoNovo = caminhoAntigo.substring(prefixo.length) || '/';
      el.setAttribute('href', caminhoNovo);
    }
    if (el.hasAttribute('src')) {
      const caminhoAntigo = el.getAttribute('src');
      const caminhoNovo = caminhoAntigo.substring(prefixo.length);
      el.setAttribute('src', caminhoNovo);
    }
  });
}

async function inicializarComponentes() {
    corrigirCaminhosParaLocalhost();
    try {
        await carregaComponente({id: "header", componente: "componentes/header.html"}); 
        
        const menuHamburguer = document.getElementById('menu-hamburguer');
        const navbarPrincipal = document.getElementById('navbar-principal');

        if (menuHamburguer && navbarPrincipal) {
            menuHamburguer.addEventListener('click', function() {
                navbarPrincipal.classList.toggle('ativo'); 
            });
        }

        carregaComponente({id: "footer", componente: "componentes/footer.html"});

    } catch (error) {
        console.error("Erro ao carregar ou configurar componentes:", error);
    }
}

// ==============================
// CONTROLE DE CLIQUES (Conexão com Banco de Dados)
// ==============================
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

// ==============================
// INICIALIZAÇÃO DO SCRIPT (Init)
// ==============================
document.addEventListener("DOMContentLoaded", function() {
  bindCliqueTracking();
  
  renderHome();
  renderAtividades();
  
  if (document.getElementById("current-year")) {
    document.getElementById("current-year").textContent = new Date().getFullYear();
  }

  inicializarComponentes();
});
