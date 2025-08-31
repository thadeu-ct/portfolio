// app.js
const PROJETOS_URL = "projetos/projetos.json";
const SKILLS_URL = "skills.json";
const CLIQUES_KEY = "projetosCliques_v1";

let skillsMap = {}; // cache global

// -------- utils de storage --------
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

// -------- carregar dados --------
async function loadProjetos() {
  const res = await fetch(PROJETOS_URL, { cache: "no-store" });
  const data = await res.json(); // { projetos: [...] }
  const mapa = getCliquesMap();

  // mescla contadores locais
  data.projetos.forEach(p => {
    if (mapa[p.id] != null) p.cliques = mapa[p.id];
  });
  return data.projetos;
}

async function loadSkills() {
  if (Object.keys(skillsMap).length > 0) return skillsMap; // já carregado
  const res = await fetch(SKILLS_URL, { cache: "no-store" });
  skillsMap = await res.json(); // { "Python": "fa-brands fa-python", ... }
  return skillsMap;
}

// -------- contador de cliques --------
function contarClique(id) {
  const mapa = getCliquesMap();
  mapa[id] = (mapa[id] || 0) + 1;
  setCliquesMap(mapa);
}

// vincula qualquer <a.saiba-mais data-id="...">
function bindCliqueTracking() {
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a.saiba-mais[data-id]');
    if (!a) return;
    const id = a.dataset.id;
    if (id) {
      contarClique(id); // incrementa antes de navegar
    }
  }, { capture: true });
}

// -------- vitrine Top5 + Novo --------
function pickDestaques(list, nTop = 5) {
  const novo = list.find(p => p.novo);
  const restantes = list
    .filter(p => !p.novo)
    .sort((a, b) => (b.cliques || 0) - (a.cliques || 0))
    .slice(0, nTop);

  return novo ? [novo, ...restantes] : restantes;
}

async function renderHome() {
  const container = document.getElementById("projetos-home");
  if (!container) return; // se não tem a seção, não faz nada

  const [projetos, skills] = await Promise.all([loadProjetos(), loadSkills()]);
  const destaques = pickDestaques(projetos, 5);

  container.innerHTML = destaques.map(p => projetoCardHTML(p, skills)).join("");
}

async function renderAtividades() {
  const container = document.getElementById("projetos-atividades");
  if (!container) return;

  const [projetos, skills] = await Promise.all([loadProjetos(), loadSkills()]);

  projetos.sort((a, b) => a.nome.localeCompare(b.nome));

  container.innerHTML = projetos.map(p => projetoCardHTML(p, skills)).join("");
}


// -------- init --------
document.addEventListener("DOMContentLoaded", async () => {
  bindCliqueTracking();
  renderHome();
  renderAtividades(); 
});


function projetoCardHTML(p, skillsMap) {
  let skills = (p.skill || []).map(s => {
    const data = skillsMap[s] || { icon: "fa-solid fa-tag", color: "#555" };
    return `<span class="skill-chip" style="background:${data.color}20; color:${data.color}">
              <i class="${data.icon}"></i> ${s}
            </span>`;
  });

  // insere o NOVO como a primeira etiqueta
  if (p.novo) {
    skills.unshift(`
      <span class="skill-chip tag-novo">
        <i class="fa-solid fa-star"></i> NOVO
      </span>
    `);
  }

  return `
    <div class="card-spotlight ${p.novo ? "card-novo" : ""}">
      <div class="card-spotlight-head">
        <h3>${p.nome}</h3>
      </div>
      <p class="desc">${p.descricao}</p>
      <div class="skills-line">${skills.join("")}</div>
      <a href="projetos/${p.link}" class="saiba-mais" data-id="${p.id}">Saiba mais…</a>
    </div>
  `;
}

