var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const PORT = process.env.PORT || 5000

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var colors = ['#ff0000', '#00ff00', '#0000ff'];

let INITIAL_COUNTDOWN_TIME = 0;
let MAX_COUNTDOWN_TIME = 10;
let MAX_GAME_TIME = 30;

var playerCount = 0;
var players = {};
let mode = 0;
let gameTime = 0;
let startTime = INITIAL_COUNTDOWN_TIME;
let startTimer = null;
let startTimeout = null;
let gameTimer = null;


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

    //playerCount++;
    playerCount = Object.keys(players).length;

    io.sockets.emit('update', players);
    console.log('new player', socket.id, JSON.stringify(players));
    console.log('count', playerCount);

    if (playerCount > 1 && mode == 0) {
      clearTimeout(startTimeout);
      startTimeout = setTimeout(() => startCountdown(), 100);
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
     //playerCount--;
     playerCount = Object.keys(players).length;
     io.sockets.emit('update', players);

     //TODO:: check if enough players to keep playing..
     if (playerCount < 2) {
       mode = 0;
       io.sockets.emit('modeChange', mode);
       clearTimeout(startTimeout);
       clearInterval(startTimer);
       clearInterval(gameTimer);
     }

  });
});

function startCountdown() {
  mode = 1;
  startTime = INITIAL_COUNTDOWN_TIME;
  io.sockets.emit('modeChange', mode);
  io.sockets.emit('startTime', {time: startTime, max: MAX_COUNTDOWN_TIME});
  clearInterval(startTimer);
  startTimer = setInterval(() => gameCountdown(), 1000);
}

function gameOver() {
  io.sockets.emit('final', players);

  //TODO:: maybe wait for some trigger from arduino to move on??
  setTimeout(() => {
    if (playerCount > 1) { //if enough players go again...
      clearTimeout(startTimeout);
      startTimeout = setTimeout(() => startCountdown(), 100);
    } else {
      mode = 0;
      io.sockets.emit('modeChange', mode);
    }
  }, 10000); //run final animation for 10 seconds..
}

function gameInterval() {
  gameTime ++;
  console.log('game update');
  io.sockets.emit('gameTime', {time: gameTime, max: MAX_GAME_TIME});

  if (gameTime == MAX_GAME_TIME + 1){

    mode = 3;
    io.sockets.emit('modeChange', mode);

    clearInterval(gameTimer);
    gameOver();
  }
}

function startGame() {
  console.log('gameplay');

  for (i in players) { //reset scores
    players[i].score = 0;
  }
  io.sockets.emit('update', players);

  gameTime = 0;
  io.sockets.emit('gameTime', {time: gameTime, max: MAX_GAME_TIME});

  mode = 2;
  io.sockets.emit('modeChange', mode);

  clearInterval(gameTimer);
  gameTimer = setInterval(() => gameInterval(), 1000);
}

//game countdown
function gameCountdown() {
  startTime ++;

  console.log('startTimer', startTime);
  io.sockets.emit('startTime', {time: startTime, max: MAX_COUNTDOWN_TIME});

  if (startTime === MAX_COUNTDOWN_TIME + 1) {
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
