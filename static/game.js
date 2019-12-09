var socket = io();

var id;
let mode = 0;

let waitingView = document.getElementById('waitingView');
let gameplayView = document.getElementById('gameplayView');
let countdownView = document.getElementById('countdownView');
let gameoverView = document.getElementById('gameoverView');

let otherscoresEl = document.getElementById('otherscores');
let myscoreEl = document.getElementById('myscore');
let canvas = document.getElementById('canvas');
let countdownEl = document.getElementById('countdown');
let gametimeEl = document.getElementById('gametime');
let playerlistEl = document.getElementById('playerlist');
let gameoverEl = document.getElementById('gameoverText');
let finalscoreEl = document.getElementById('finalscore');

let playercountEl = document.getElementById('playercount');

let ctx = canvas.getContext('2d');
let circles = [];
let mycolor = 'black';

let winnerColor = null;

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
canvas.style.width = canvas.width + 'px';
canvas.style.height = canvas.height + 'px';

socket.emit('new player');

socket.on('connect', function(){
  id = socket.io.engine.id;
  let title = document.getElementById('title');
  title.innerText = id;
});

socket.on('update', function(data) {
  otherscoresEl.innerText = "";
  playerlistEl.innerText = "";

  let count = 0;

  for (i in data) {
    if (i == id) {
      myscoreEl.innerText = data[id].score;
      mycolor = data[id].color;
    } else {
      //addOtherScore(data, i);
      listPlayers(data, i);
    }

    count ++;
  }

  playercountEl.innerText = count;
});

socket.on('final', function(data) {
  let winner;

  for (i in data) {

    if (i == id) {
      finalscoreEl.innerText = data[id].score;
    }

    if (!winner) {
      winner = {id: i, score: data[i].score, color: data[i].color};
    } else {
      if (data[i].score > winner.score) {
        winner = {id: i, score: data[i].score, color: data[i].color};
      }
    }
  }

  if (winner.id == id && winner.score != 0) {
    gameoverEl.innerText = "You Win!";
  } else {
    gameoverEl.innerText = "";
  }

  if (winner.score != 0) {
    winnerColor = winner.color;
  } else {
    winnerColor = "#000000";
  }
});

socket.on('startTime', function(data) {
  countdownEl.innerText = data.max - data.time; //make sure to subtract total
});

socket.on('gameTime', function(data) {
  gametimeEl.innerText = data.max - data.time;
});

socket.on('modeChange', function(data) {
  //countdownEl.innerText = 5 - data;
  mode = data;

  switch (data) {
    case 0: //waiting
      waitingView.style.display = "flex";
      gameplayView.style.display = "none";
      countdownView.style.display = "none";
      gameoverView.style.display = "none";
      break;
    case 1: //countdown
      waitingView.style.display = "none";
      gameplayView.style.display = "none";
      countdownView.style.display = "flex";
      gameoverView.style.display = "none";
      break;
    case 2: //gameplay
      waitingView.style.display = "none";
      gameplayView.style.display = "flex";
      countdownView.style.display = "none";
      gameoverView.style.display = "none";
      break;
    case 3: //gameover
      circles = [];
      waitingView.style.display = "none";
      gameplayView.style.display = "none";
      countdownView.style.display = "none";
      gameoverView.style.display = "flex";
      break;
  }
});

function listPlayers(data, i) {
  let container = document.createElement('div');
  let label = document.createElement('span');
  label.innerText = i;

  container.appendChild(label);
  playerlistEl.appendChild(container);
}

function addOtherScore(data, i) {
  let container = document.createElement('div');
  let label = document.createElement('span');
  label.innerText = i + ": ";

  let score = document.createElement('span');
  score.innerText = data[i].score;

  container.appendChild(label);
  container.appendChild(score);
  otherscoresEl.appendChild(container);
}

//input events
document.body.addEventListener('click', (e) => {
  let circle = {x: e.x, y: e.y, r: 100};
  circles.push(circle);
  socket.emit('click');
});

document.body.addEventListener('touchstart', (e) => {
  let circle = {x: e.touches[0].clientX, y: e.touches[0].clientY, r: 100};
  circles.push(circle);
  socket.emit('click');
});

let delta = 0;

function render() {

  draw();
  
  console.log(circles.length);
  requestAnimationFrame(render);
}


function draw() {
    delta += 0.05;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (winnerColor && mode == 3) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = winnerColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (mode == 0 || mode == 1) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = mycolor;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 100 + Math.sin(delta) * 40, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }

    if (mode !== 3) {
      for (var i = circles.length - 1; i > -1; i--) {
        let alpha = ((-circles[i].r / 2) + 200) / 100;

        ctx.save();
        ctx.globalAlpha = alpha < 0 ? 0 : alpha;
        ctx.fillStyle = mycolor;
        ctx.beginPath();
        ctx.arc(circles[i].x, circles[i].y, circles[i].r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        circles[i].r+=5;

        if (alpha == 0) {
          circles.splice(i, 1);
        }
      }
    }

}



requestAnimationFrame(render);
