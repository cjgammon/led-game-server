var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const PORT = process.env.PORT || 5000

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var colors = ['#ff0000', '#00ff00', '#0000ff'];

var playerCount = 0;
var players = {};
let mode = 0;
let gameTime = 0;
let startTime = 0;
let startTimer = null;
let startTimeout = null;
let gameTimer = null;

let MAX_COUNTDOWN_TIME = 5;
let MAX_GAME_TIME = 10;


app.set('port', PORT);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/arduino', function(request, response) {
  let data = {
    players,
    mode,
    gameTime,
    startTime
  };
  response.send(JSON.stringify(data));
});

// Starts the server.
server.listen(PORT, function() {
  console.log('Starting server on port 5000');
});


// Add the WebSocket handlers
io.on('connection', function(socket) {

  //console.log('start', socket)
  //TODO:: generate players based on connected

  socket.on('new player', function() {
    let color = getRandomColor();
    players[socket.id] = {score: 0, color};

    playerCount++;

    io.sockets.emit('update', players);
    console.log('new player', socket.id, JSON.stringify(players));
    console.log('count', playerCount);

    if (playerCount > 1 && mode == 0) {
      clearTimeout(startTimeout);
      startTimeout = setTimeout(() => startCountdown(), 1000);
      //startCountdown();
    }
  });

  socket.on('click', function() {
    if (!players[socket.id]){
      return;
    }

    players[socket.id].score ++;
    io.sockets.emit('update', players);
  });

  socket.on('disconnect', function() {
     delete players[socket.id];
     playerCount--;
     io.sockets.emit('update', players);
  });
});

function startCountdown() {
  mode = 1;
  io.sockets.emit('modeChange', mode);
  startTimer = setInterval(() => gameCountdown(), 1000);
}

function gameOver() {
  //timeout to reset
  setTimeout(() => {
    clearTimeout(startTimeout);
    startTimeout = setTimeout(() => startCountdown(), 1000);
  }, 1000)
}

function gameInterval() {
  gameTime ++;
  console.log('game update');
  io.sockets.emit('gameTime', gameTime);

  if (gameTime == MAX_GAME_TIME){
    gameTime = 0;
    mode = 3;
    io.sockets.emit('modeChange', mode);
    clearInterval(gameTimer);
    gameOver();
  }
}

function startGame() {
  console.log('gameplay');
  mode = 2;
  io.sockets.emit('modeChange', mode);
  startTime = 0;
  gameTime = 0;
  gameTimer = setInterval(() => gameInterval(), 1000);
}

//game countdown
function gameCountdown() {
  startTime ++;

  console.log('startTimer', startTime);
  io.sockets.emit('startTime', startTime);

  if (startTime === MAX_COUNTDOWN_TIME) {
    startGame();
    clearInterval(startTimer);
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
