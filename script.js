/*
 * Flappy Nano – logique du jeu.
 * Ce script gère le dessin, la physique, l'interface utilisateur et le partage.
 */

// Récupération des éléments du DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const retryButton = document.getElementById('retry-button');
const shareButton = document.getElementById('share-button');

// Paramètres du jeu
const bird = {
  x: 80,
  y: canvas.height / 2,
  radius: 12,
  velocity: 0,
  gravity: 0.4,
  lift: -7,
};

let pipes = [];
let frameCount = 0;
const spawnInterval = 90; // nombre de frames entre les tuyaux
const pipeWidth = 50;
const gapHeight = 140;
const speed = 2.2; // vitesse de déplacement des tuyaux
let gameRunning = false;
let gameOver = false;
let score = 0;

// Réinitialise le jeu pour commencer ou recommencer
function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  gameRunning = false;
  gameOver = false;
  finalScoreEl.textContent = 'Score : 0';
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
  draw();
}

// Lance la boucle principale du jeu
function startGame() {
  if (!gameRunning && !gameOver) {
    gameRunning = true;
    startScreen.style.display = 'none';
    requestAnimationFrame(update);
  }
}

// Mise à jour de la scène à chaque frame
function update() {
  if (!gameRunning) return;
  frameCount++;

  // Génération d'un nouveau tuyau à intervalles réguliers
  if (frameCount % spawnInterval === 0) {
    const maxTop = canvas.height - gapHeight - 120;
    const minTop = 40;
    const topHeight = Math.random() * (maxTop - minTop) + minTop;
    pipes.push({
      x: canvas.width,
      top: topHeight,
      bottom: topHeight + gapHeight,
      passed: false,
    });
  }

  // Mise à jour de l'oiseau (gravité et déplacement vertical)
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Limitation du haut et du bas du canvas
  if (bird.y + bird.radius > canvas.height) {
    bird.y = canvas.height - bird.radius;
    endGame();
    return;
  }
  if (bird.y - bird.radius < 0) {
    bird.y = bird.radius;
    bird.velocity = 0;
  }

  // Mise à jour et vérification des tuyaux
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= speed;

    // Incrémentation du score lorsque le tuyau est dépassé
    if (!p.passed && p.x + pipeWidth < bird.x) {
      p.passed = true;
      score++;
    }

    // Détection de collision avec l'oiseau
    const birdHitsTubeHorizontally =
      bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + pipeWidth;
    const birdHitsTubeVertically =
      bird.y - bird.radius < p.top || bird.y + bird.radius > p.bottom;
    if (birdHitsTubeHorizontally && birdHitsTubeVertically) {
      endGame();
      return;
    }

    // Suppression des tuyaux sortis de l'écran
    if (p.x + pipeWidth < -10) {
      pipes.splice(i, 1);
    }
  }

  draw();
  requestAnimationFrame(update);
}

// Dessine l'ensemble de la scène
function draw() {
  // Fond
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessine les tuyaux
  ctx.fillStyle = '#5da130';
  pipes.forEach((p) => {
    // tuyau supérieur
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    // tuyau inférieur
    ctx.fillRect(p.x, p.bottom, pipeWidth, canvas.height - p.bottom);
  });

  // Dessine l'oiseau
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fill();

  // Affiche le score en haut à gauche
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px sans-serif';
  ctx.fillText('Score : ' + score, 10, 30);
}

// Applique un saut (flap) à l'oiseau
function flap() {
  if (gameRunning) {
    bird.velocity = bird.lift;
  } else if (!gameRunning && !gameOver) {
    // Démarrage rapide en cliquant
    startGame();
    bird.velocity = bird.lift;
  }
}

// Fin du jeu : affiche l'écran de Game Over
function endGame() {
  gameRunning = false;
  gameOver = true;
  finalScoreEl.textContent = 'Score : ' + score;
  gameOverScreen.style.display = 'flex';
}

// Écouteurs d'événements pour l'interaction utilisateur
canvas.addEventListener('mousedown', flap);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    flap();
  }
});

// Permet de démarrer le jeu en cliquant sur l'écran de démarrage
startScreen.addEventListener('mousedown', () => {
  // Démarrer et appliquer un premier saut si le jeu n'est pas encore en cours
  if (!gameRunning && !gameOver) {
    startGame();
    bird.velocity = bird.lift;
  }
});

retryButton.addEventListener('click', () => {
  resetGame();
});

shareButton.addEventListener('click', () => {
  const shareText =
    'Je viens de marquer ' +
    score +
    ' point' +
    (score > 1 ? 's' : '') +
    ' sur Flappy Nano ! Essayez-le ici : ';
  // Utilise encodeURIComponent pour échapper les caractères spéciaux
  const url = window.location.href;
  const tweet =
    'https://twitter.com/intent/tweet?text=' +
    encodeURIComponent(shareText + url + ' #FlappyNano');
  window.open(tweet, '_blank');
});

// Démarrage initial
resetGame();
