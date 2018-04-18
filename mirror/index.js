
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const log = console.log; // for debugging
// const log = function () {}; // for prod

app.get('/', function(req, res){
  res.json({
    "message":"iturramasat mirror started"
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on("p", function (params) {
    params.forEach(function (parameter) {
      socket.broadcast.emit(parameter.name, parameter.value);
      log(parameter.name + ": " + parameter.value);
    });
  });

  socket.on("m", function (params) {
      socket.broadcast.emit("midi", params);
      log(params);
  })
});
