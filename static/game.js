var socket = io();

var id;
let otherscoresEl = document.getElementById('otherscores');
let myscoreEl = document.getElementById('myscore');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

socket.emit('new player');

socket.on('connect', function(){
  id = socket.io.engine.id;
  let title = document.getElementById('title');
  title.innerText = id;
});

socket.on('update', function(data) {
  console.log('update::', data);

  otherscoresEl.innerText = "";

  for (i in data) {
    if (i == id) {
      myscoreEl.innerText = data[id].score;
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

  console.log(otherscoresEl, i, data[i].score);
}

document.body.addEventListener('click', () => {
  socket.emit('click');
})
