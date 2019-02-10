var socket = io();

var id;

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

let ctx = canvas.getContext('2d');
let circles = [];
let mycolor = 'black';

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

  for (i in data) {
    if (i == id) {
      myscoreEl.innerText = data[id].score;
      mycolor = data[id].color;
      console.log('color', mycolor);
    } else {
      //addOtherScore(data, i);
      listPlayers(data, i);
    }
  }
});

socket.on('startTime', function(data) {
  countdownEl.innerText = 5 - data;
});

socket.on('gameTime', function(data) {
  gametimeEl.innerText = data;
});

socket.on('modeChange', function(data) {
  //countdownEl.innerText = 5 - data;

  switch (data) {
    case 0: //waiting
      waitingView.style.display = "block";
      gameplayView.style.display = "none";
      countdownView.style.display = "none";
      gameoverView.style.display = "none";
      break;
    case 1: //countdown
      waitingView.style.display = "none";
      gameplayView.style.display = "none";
      countdownView.style.display = "block";
      gameoverView.style.display = "none";
      break;
    case 2: //gameplay
      waitingView.style.display = "none";
      gameplayView.style.display = "block";
      countdownView.style.display = "none";
      gameoverView.style.display = "none";
      break;
    case 3: //gameover
      waitingView.style.display = "none";
      gameplayView.style.display = "none";
      countdownView.style.display = "none";
      gameoverView.style.display = "block";
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

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < circles.length; i++) {
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
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
