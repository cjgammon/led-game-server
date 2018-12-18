var socket = io();

var id;
let otherscoresEl = document.getElementById('otherscores');
let myscoreEl = document.getElementById('myscore');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let circles = [];
let mycolor = 'black';

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
canvas.style.width = document.documentElement.clientWidth + 'px';
canvas.style.height = document.documentElement.clientHeight + 'px';



socket.emit('new player');

socket.on('connect', function(){
  id = socket.io.engine.id;
  let title = document.getElementById('title');
  title.innerText = id;
});

socket.on('update', function(data) {
  otherscoresEl.innerText = "";

  for (i in data) {
    if (i == id) {
      myscoreEl.innerText = data[id].score;
      mycolor = data[id].color;
      console.log('color', mycolor);
    } else {
      addOtherScore(data, i);
    }
  }
});

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
