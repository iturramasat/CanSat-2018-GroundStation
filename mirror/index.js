var fs = require( 'fs' );
var app = require('express')();
var https        = require('https');

var server = https.createServer({
                key: fs.readFileSync('privkey1.pem'),
                cert: fs.readFileSync('fullchain1.pem')
             },app);

var io = require('socket.io').listen(server);

server.listen(3000, function(){
  console.log('listening on *:3000');
});
parameters = [];
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on("p", function (params) {
    params.forEach(function (parameter) {
      socket.broadcast.emit(parameter.name, parameter.value);
      console.log(parameter.name + ": " + parameter.value);
      parameters[parameter.name] = parameter.value;
    });
  });

  socket.on("resend", function () {
    Object.keys(parameters).forEach(function (parameter) {
      socket.emit(parameter, parameters[parameter]);
    });
  });

  socket.on("parachute", function (value) {
    socket.broadcast.emit("parachute", value)
  });

  /*socket.on("m", function (params) {
      socket.broadcast.emit("midi", params);
      log(params);
  });*/
});
