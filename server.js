var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});


var players = {};

// Add the WebSocket handlers
io.on('connection', function(socket) {
  socket.on('new player', function() {
     players[socket.id] = {};
     console.log('new player', socket.id, JSON.stringify(players));
  });

  socket.on('click', function() {
    console.log("click!", socket.id);
  });

  socket.on('disconnect', function() {
     console.log('Got disconnect!');
     delete players[socket.id];
  });
});

setInterval(function() {
  io.sockets.emit('message', 'hi!');
}, 1000);
