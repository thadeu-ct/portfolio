// NO SEU carousel.js (SUBSTITUA TUDO NOVAMENTE)

document.addEventListener("DOMContentLoaded", () => {
    setupCoverflowCarousel('riobotz-carousel');
});

function setupCoverflowCarousel(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) return;

    const cards = Array.from(carouselContainer.querySelectorAll('.carousel-card-wrapper'));
    const prevButton = carouselContainer.querySelector('.prev-button');
    const nextButton = carouselContainer.querySelector('.next-button');
    
    if (cards.length === 0) return;

    let currentIndex = Math.floor(cards.length / 2);
    let autoPlayInterval;

    // A SUA IDEIA IMPLEMENTADA: 5 "LUGARES" FIXOS NA TELA
    // Cada lugar tem: [posição X, escala, z-index, opacidade]
    const positions = {
        '-2': { transform: 'translateX(-450px) scale(0.7)', zIndex: 1, opacity: 0.4 }, // Longe na Esquerda
        '-1': { transform: 'translateX(-220px) scale(0.9)', zIndex: 5, opacity: 0.7 }, // Adjacente Esquerda
        '0':  { transform: 'translateX(0) scale(1.15)',      zIndex: 10, opacity: 1 },    // Centro
        '1':  { transform: 'translateX(220px) scale(0.9)', zIndex: 5, opacity: 0.7 }, // Adjacente Direita
        '2':  { transform: 'translateX(450px) scale(0.7)', zIndex: 1, opacity: 0.4 }  // Longe na Direita
    };

    // Estilo padrão para cards que estão "fora da tela"
    const hiddenStyle = { transform: 'scale(0.5)', zIndex: 0, opacity: 0 };

    function updateCarousel() {
        cards.forEach((card, index) => {
            // Calcula a posição circular de cada card em relação ao centro (-2, -1, 0, 1, 2)
            let diff = index - currentIndex;
            if (diff < -Math.floor(cards.length / 2)) diff += cards.length;
            if (diff > Math.floor(cards.length / 2)) diff -= cards.length;

            // Pega o estilo do "lugar" correspondente ou o estilo "escondido"
            const style = positions[diff] || hiddenStyle;

            // Aplica os estilos diretamente no elemento
            card.style.transform = style.transform;
            card.style.zIndex = style.zIndex;
            card.style.opacity = style.opacity;

            // Adiciona/remove a classe 'center' apenas para o efeito de brilho do CSS
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

    // Event Listeners
    nextButton.addEventListener('click', () => {
        moveToNext();
        startAutoPlay();
    });
    
    prevButton.addEventListener('click', () => {
        moveToPrev();
        startAutoPlay();
    });

    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carouselContainer.addEventListener('mouseleave', startAutoPlay);

    // Inicia tudo
    updateCarousel();
    startAutoPlay();
}