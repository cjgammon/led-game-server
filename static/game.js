var socket = io();

socket.on('connect', function(){
  var id = socket.io.engine.id;
  console.log('id', id);
  let title = document.getElementById('title');
  title.innerText = id;
})

socket.on('message', function(data) {
  console.log('msg', data);
});

socket.emit('new player');

document.body.addEventListener('click', () => {
  socket.emit('click');
})
