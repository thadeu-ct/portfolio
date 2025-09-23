// NO SEU carousel.js (SUBSTITUA TUDO)
document.addEventListener("DOMContentLoaded", () => {
    // Agora o script vai procurar o ID correto em qualquer página que for chamado
    setupCoverflowCarousel('riobotz-carousel');
});

// FUNÇÃO PARA CRIAR O HTML DE UM CARD
function createCarouselCardHTML(competicao) {
    return `
        <div class="carousel-card-wrapper">
            <div class="card-atividade">
                <h4>${competicao.titulo}</h4>
                <p>${competicao.descricao}</p>
            </div>
        </div>
    `;
}

async function setupCoverflowCarousel(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) return;

    const track = carouselContainer.querySelector('.coverflow-carousel-track');
    const prevButton = carouselContainer.querySelector('.prev-button');
    const nextButton = carouselContainer.querySelector('.next-button');

    // 1. CARREGAR DADOS DO JSON
    const response = await fetch('competicoes.json');
    const data = await response.json();
    const competicoes = data.competicoes;

    // 2. CONSTRUIR O HTML DOS CARDS E INSERIR NO TRACK
    track.innerHTML = competicoes.map(createCarouselCardHTML).join('');

    // 3. CONTINUAR COM A LÓGICA DO CARROSSEL
    const cards = Array.from(track.querySelectorAll('.carousel-card-wrapper'));
    if (cards.length === 0) return;

    let currentIndex = Math.floor(cards.length / 2);
    let autoPlayInterval;

    const positions = {
        '-2': { transform: 'translateX(-450px) scale(0.7)', zIndex: 1, opacity: 0.4 },
        '-1': { transform: 'translateX(-220px) scale(0.9)', zIndex: 5, opacity: 0.7 },
        '0':  { transform: 'translateX(0) scale(1.15)',      zIndex: 10, opacity: 1 },
        '1':  { transform: 'translateX(220px) scale(0.9)', zIndex: 5, opacity: 0.7 },
        '2':  { transform: 'translateX(450px) scale(0.7)', zIndex: 1, opacity: 0.4 }
    };
    const hiddenStyle = { transform: 'scale(0.5)', zIndex: 0, opacity: 0 };

    function updateCarousel() {
        cards.forEach((card, index) => {
            let diff = index - currentIndex;
            if (diff < -Math.floor(cards.length / 2)) diff += cards.length;
            if (diff > Math.floor(cards.length / 2)) diff -= cards.length;
            const style = positions[diff] || hiddenStyle;
            card.style.transform = style.transform;
            card.style.zIndex = style.zIndex;
            card.style.opacity = style.opacity;
            card.classList.toggle('center', diff === 0);
        });
    }
    
    function moveToNext() {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }
    
    function moveToPrev() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }

    function startAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(moveToNext, 5000);
    }

    nextButton.addEventListener('click', () => { moveToNext(); startAutoPlay(); });
    prevButton.addEventListener('click', () => { moveToPrev(); startAutoPlay(); });
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carouselContainer.addEventListener('mouseleave', startAutoPlay);

    updateCarousel();
    startAutoPlay();
}