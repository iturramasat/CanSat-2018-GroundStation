const config = require(__dirname + '/../../config.json');
var SerialPort = require('serialport');
var parsers = SerialPort.parsers;
var socket = require('socket.io-client')(config.socketServer);

console.log("connecting to " + config.socketServer);
socket.on('connect', function(){
  console.log("Connected to socket server");
});

socket.on('event', function(data){});
socket.on('disconnect', function(){
  console.log("Disconnected from socket server");
});

let port = new SerialPort("/dev/ttyACM0", {
  baudRate:115200,
  //parser:SerialPort.parsers.readline(';')
});

port.on("open", function(){
  console.log("Port openned");
});

socket.on("parachute", function (value) {
  console.log("Received parachute event");
  if(value == true){
    port.write("A", function (err) {
      if(err){
        console.log("ERROR: " + err)
      }
    });
  } else {
    port.write("B", function (err) {
      if(err){
        console.log("ERROR: " + err)
      }
    });
  }
});
