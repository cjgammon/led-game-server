var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const PORT = process.env.PORT || 5000

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', PORT);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/arduino', function(request, response) {
  response.send([JSON.stringify(players) + "\n\r"]);
});

// Starts the server.
server.listen(PORT, function() {
  console.log('Starting server on port 5000');
});

var colors = ['#ff0000', '#00ff00', '#0000ff'];

var playerCount = 0;
var players = {};

// Add the WebSocket handlers
io.on('connection', function(socket) {

  socket.on('new player', function() {
    let color = getRandomColor();
    players[socket.id] = {score: 0, color};
    playerCount++;

    io.sockets.emit('update', players);
    console.log('new player', socket.id, JSON.stringify(players));
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

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
