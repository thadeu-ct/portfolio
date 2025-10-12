document.addEventListener("DOMContentLoaded", () => {
    configurarCarrosselFlow({id: 'riobotz-carrossel'});
});

function criaHTMLCardCarrossel(competicao) {
    return `
        <div class="carrossel-itens">
            <div class="card-atividade">
                <h4>${competicao.titulo}</h4>
                <p>${competicao.descricao}</p>
            </div>
        </div>
    `;
}

async function configurarCarrosselFlow({id: carrosselId}) {
    const carrosselContainer = document.getElementById(carrosselId);
    if (!carrosselContainer) return;

    const track = carrosselContainer.querySelector('.coverflow-carrossel-track');
    const botaoPrev = carrosselContainer.querySelector('.prev-button');
    const botaoProx = carrosselContainer.querySelector('.prox-button');

    const evento = await fetch('competicoes.json');
    const dados = await evento.json();
    const competicoes = dados.competicoes;

    track.innerHTML = competicoes.map(criaHTMLCardCarrossel).join('');

    const cards = Array.from(track.querySelectorAll('.carrossel-itens'));
    if (cards.length === 0) return;

    let indiceAtual = Math.floor(cards.length / 2);
    let moverAutoPlay;

    const positions = {
        '-2': { transform: 'translateX(-175%) translateY(-50%) scale(0.7)',  zIndex: 1,  opacity: 0.4 },
        '-1': { transform: 'translateX(-125%) translateY(-50%) scale(0.9)',  zIndex: 5,  opacity: 0.7 },
         '0': { transform: 'translateX(-50%)  translateY(-50%) scale(1.15)', zIndex: 10, opacity: 1.0 },
         '1': { transform: 'translateX(25%)   translateY(-50%) scale(0.9)',  zIndex: 5,  opacity: 0.7 },
         '2': { transform: 'translateX(75%)   translateY(-50%) scale(0.7)',  zIndex: 1,  opacity: 0.4 }
    };
    const hiddenStyle = { transform: 'scale(0.5)', zIndex: 0, opacity: 0 };

    function atualizaCarrossel() {
        cards.forEach((card, index) => {
            let diff = index - indiceAtual;
            if (diff < -Math.floor(cards.length / 2)) diff += cards.length;
            if (diff > Math.floor(cards.length / 2)) diff -= cards.length;
            const style = positions[diff] || hiddenStyle;
            card.style.transform = style.transform;
            card.style.zIndex = style.zIndex;
            card.style.opacity = style.opacity;
            card.classList.toggle('center', diff === 0);
        });
    }
    
    function moverProximo() {
        indiceAtual = (indiceAtual + 1) % cards.length;
        atualizaCarrossel();
    }
    
    function moverAnterior() {
        indiceAtual = (indiceAtual - 1 + cards.length) % cards.length;
        atualizaCarrossel();
    }

    function iniciarAutoPlay() {
        clearInterval(moverAutoPlay);
        moverAutoPlay = setInterval(moverProximo, 5000);
    }

    botaoProx.addEventListener('click', () => { moverProximo(); iniciarAutoPlay(); });
    botaoPrev.addEventListener('click', () => { moverAnterior(); iniciarAutoPlay(); });
    carrosselContainer.addEventListener('mouseenter', () => clearInterval(moverAutoPlay));
    carrosselContainer.addEventListener('mouseleave', iniciarAutoPlay);

    atualizaCarrossel();
    iniciarAutoPlay();
}