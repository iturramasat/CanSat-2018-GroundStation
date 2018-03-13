/*

  Custom protocol based in ITURRAMASAT PROTOCOL.

*/

/*

BMP PRESIOA
BMP temp
LM35
MPX
lat
gpslong
gps_time
gps_speed
gps_*/

const emitter = require('central-event');
const packetloss = require("./packetloss.js");
var log = require(__dirname + "/consolelog.js").log;
var config = require(__dirname + '/../config.json');
var SerialPort = require('serialport');
var parsers = SerialPort.parsers;
var recvConfig = config.iturramasat_receiver;
var hCalculator = require(__dirname + "/altitude_calculator.js");

class Receiver {
  static init(){
    var that = Receiver;
    that.connected = false;
    that.tty = recvConfig.tty;
    that.currentValues = {};
    that.simulateFirstGPS();
    that.connect();
  }

  static emit(evt, value){
    var that = Receiver;
    emitter.emit(evt, value);
  }

  static connect(){
    var that = Receiver;
    if(that.connected){
      log("receiver", "Already connected to the GroundStation");
      return false;
    }

    that.port = new SerialPort(that.tty, {
      baudRate:recvConfig.baudrate,
      parser:SerialPort.parsers.readline(';')
    });
    that.port.on("error", function (error) {
      log("serial", error);
    })
    that.port.on("open", function(){
      log("receiver", "Successfully connected to the receiver");
      that.connected = true;
      that.emit("receiverConnectionChange", {
        "connected": true,
        "tty": that.tty
      });
      that.port.write("Ping!");
      that.port.on("data", function(data){
        log("receiver", data);

        var parsedData = data.split(":");
        var now = new Date().getTime();

        if(parsedData.length === 5){ // Default telemetry
          let pd = parsedData;

          packetloss.registerID(pd[0]);
          let send = [
            {
              "name":"bmp",
              "value":parseFloat(pd[1])
            },
            {
              "name":"lm35",
              "value":parseFloat(pd[2])
            },
            {
              "name":"packetloss",
              "value": Math.round(packetloss.calculatePacketLoss()*100)/100
            }
          ]

          send.forEach(function (parameter) {
            that.emit("receivedValue", {
              "name": parameter.name,
              "time": now,
              "value": parameter.value
            });
          });
        } else if (parsedData.length === 2){
          log("cansat", parsedData[1]);
          var now = Date.now();
          that.emit("receivedValue", {
            "name": "cansatMsg",
            "time": now,
            "value": parsedData[1]
          });
        } else {
          log("protocol", "no-valid values received: " + data);
          var now = Date.now();
          that.emit("receivedValue", {
            "name": "cansatUnknown",
            "time": now,
            "value": data
          });
        }
      })
    });
  }

  static simulateFirstGPS(){
    var that = Receiver;
    var now = Date.now();
    log("receiver", "simulating first GPS coords..");
    that.emit("receivedValue", {
      "name": "gpslat",
      "time": now,
      "value": recvConfig.firstPos.lat
    });
    that.emit("receivedValue", {
      "name": "gpslong",
      "time": now,
      "value": recvConfig.firstPos.lng
    });
  }
}


Receiver.init();

module.exports = Receiver;
