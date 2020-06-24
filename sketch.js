let video;
let imageClassifier;
let modelURL = 'https://teachablemachine.withgoogle.com/models/zUy3bm5wW/model.json';
let startButton;
let options = ['ROCK', 'PAPER', 'SCISSORS!'];
let seconds = 0;
let sounds = [];
let animation = false;
let user, ai;
let images = [];
let gameMechanics = { scissors: 'rock', rock: 'paper', paper: 'scissors' }; // Key is object and value is defeater
let winner;
let collided = false;
let counter = 0;
let prevWinnerElt;
let round = 0;
let gameStopped = false;
let aiScore, userScore;
let font;
let gameOverSound;
let userSelections = [];

function preload() {
  gameOverSound = loadSound('assets/game-over.mp3');
  font = loadFont('assets/ARIMO-ITALIC.TTF');
  for (let i = 0; i < 2; i++) {
    sounds[i] = loadSound(`assets/sound${i + 1}.${i == 0 ? 'wav' : 'mp3'}`);
  }
  // images[0] are for user, images[i] are for ai
  let keys = Object.keys(gameMechanics);
  for (let n = 0; n < 2; n++) {
    let imgs = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      imgs[key] = loadImage(`assets/${n == 0 ? 'user' : 'ai'}/${key}.png`);
    }
    images[n] = imgs;
  }
}

function setup() {
  createCanvas(800, 300);
  video = createCapture({
    video: {
      height: 300,
      width: 300,
    },
    audio: false,
  });
  video.hide();
  imageClassifier = ml5.imageClassifier(modelURL, video, () => console.log('Model Ready'));
  startButton = select('#start-button');
  startButton.mousePressed(start);
}

function start() {
  let element = document.getElementById('start-button');
  element.parentNode.removeChild(element);
  let div = document.getElementById('indicator');
  div.style.top = '330px';
  let p = document.getElementById('indicator-text');
  p.classList.add('text');
  game();
  let buttonDiv = document.getElementById('stop-button');
  let button = document.createElement('button');
  var text = document.createTextNode('STOP');
  button.appendChild(text);
  button.classList.add('button');
  button.id = 'stop-button';
  button.onclick = stopGame;
  buttonDiv.appendChild(button);
}

function stopGame() {
  gameStopped = true;
  aiScore = +document.getElementById('ai').textContent.match(/\d+/)[0];
  userScore = +document.getElementById('user').textContent.match(/\d+/)[0];
  resizeCanvas(windowWidth - 10, windowHeight - 20);
  // Firework settings
  if (userScore >= aiScore) {
    gravity = createVector(0, 0.2);
    colorMode(HSB);
    addFirework();
    setInterval(addFirework, 2000);
    letter = (aiScore == userScore ? 'TIE' : 'YOUWIN!').split('');
  }
  let stopButton = select('#stop-button');
  stopButton.hide();
  document.getElementById('instructions').remove();
  document.getElementById('scores').remove();
  document.getElementById('indicator').remove();
  document.getElementById('attribution').remove();
  document.getElementById('winner-list').remove();
  if (aiScore > userScore) {
    gameOverSound.play();
  }
}

function draw() {
  if (!gameStopped) {
    background(55);
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, width - video.width, height - video.height, video.width, video.height);
    pop();
    if (animation) {
      user.show();
      ai.show();
      user.update();
      ai.update();
      if (abs(user.x - ai.x) < 5 && !collided) {
        user.dir = 0;
        ai.dir = 0;
        if (user.move == ai.move) {
          winner = 'TIE';
          user.winner = false;
          ai.winner = false;
        } else if (gameMechanics[ai.move] == user.move) {
          winner = 'USER';
          ai.winner = false;
          user.grow();
        } else if (gameMechanics[user.move] == ai.move) {
          winner = 'AI';
          user.winner = false;
          ai.grow();
        }
        collided = true;
      }
      if (collided) {
        counter++;
      }
      if (counter == 20) {
        collided = false;
        counter = 0;
        animation = false;
        evaluateRound(winner);
      }
    }
  } else {
    if (userScore >= aiScore) {
      firework();
    } else {
      background(255, 0, 0);
      textSize(56);
      textAlign(CENTER, CENTER);
      text('GAME OVER!', width / 2, height / 2);
      text('YOU LOSE!', width / 2, height / 2 + 68);
    }
    textAlign(CENTER, CENTER);
    push();
    stroke(255);
    strokeWeight(1);
    noFill();
    textSize(24);
    text(`${userScore >= aiScore ? 'Your Score - ' : 'My Score - '} ${userScore >= aiScore ? userScore : aiScore}`, aiScore > userScore ? 87 : 100, 20);
    text(`${userScore >= aiScore ? 'My Score - ' : 'Your Score - '} ${userScore >= aiScore ? aiScore : userScore}`, 95, 55);
    pop();
  }
}

function evaluateRound(winner) {
  // Updating score paragraph elements
  if (winner !== 'TIE') {
    let elt = document.getElementById(winner.toLowerCase());
    let text = elt.textContent;
    let newScore = ++text.match(/\d+/)[0];
    elt.textContent = text.replace(/\d+/, newScore);
  }

  // Updating winner list
  let winnerDiv = document.getElementById('winner-list');
  if (round == 1) {
    winnerDiv.classList.add('winner-list');
  }
  if (round == 3) {
    winnerDiv.classList.add('winner-list-fixed');
  }
  let aiMove = ai.move.format();
  let userMove = user.move.format();
  let userWon = winner == 'USER';
  let winningMssg = winner == 'TIE' ? `Round ${round} - We both chose ${userMove}. It's a tie! 🙌` : `Round ${round} - You chose ${userMove}. I chose ${aiMove}. ${userWon ? userMove : aiMove} beats ${userWon ? aiMove : userMove}. ${userWon ? 'You' : 'I'} win this round! ${userWon ? '😓' : '😁'}`;
  let p = document.createElement('p');
  p.textContent = winningMssg;
  p.className = 'winner';
  p.style.fontWeight = 'bold';
  if (prevWinnerElt) {
    prevWinnerElt.style.fontWeight = 'normal';
  }
  prevWinnerElt = p;
  winnerDiv.prepend(p);
  game();
}

function game() {
  if (!gameStopped) {
    let p = document.getElementById('indicator-text');
    let index = seconds % options.length;
    p.textContent = options[index].toUpperCase();
    seconds++;
    sounds[seconds == 3 ? 1 : 0].play();
    if (seconds == 3) {
      seconds = 0;
      imageClassifier.classify(playRound);
    } else {
      setTimeout(game, 1000);
    }
  }
}

function playRound(err, result) {
  round++;
  if (err) {
    console.error(err);
  } else {
    let userSelection = result[0].label.toLowerCase();
    userSelections.push(userSelection);
    let aiOption = markovGuess(userSelection, userSelections);
    animation = true;
    user = new Move(userSelection, images[0], 1);
    ai = new Move(aiOption, images[1], -1);
  }
}

String.prototype.format = function () {
  return this.slice(0, 1).toUpperCase() + this.slice(1, this.length);
};

function markovGuess(userSelection, userSelections) {
  if (round == 1) {
    return randomMove();
  }
  let ngrams = {};
  for (let i = 0; i < userSelections.length - 1; i++) {
    let selection = userSelections[i];
    if (!ngrams[selection]) {
      ngrams[selection] = [];
    }
    ngrams[selection].push(userSelections[i + 1]);
  }
  let moves = ngrams[userSelection];
  let nextMovePrediction;
  if (moves) {
    nextMovePrediction = random(ngrams[userSelection]);
  } else {
    nextMovePrediction = markovGuess(userSelections[userSelections.length - 2], userSelections);
  }
  let defeaterMove = gameMechanics[nextMovePrediction];
  return defeaterMove;
}

function randomMove() {
  let moves = Object.keys(gameMechanics);
  return random(moves);
}
