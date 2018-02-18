/*

  Custom protocol based in ITURRAMASAT PROTOCOL.

*/

const emitter = require('central-event');
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

        if(parsedData.length === 5){
          if(typeof that.firstMeasurement == "undefined"){
            that.firstMeasurement = true;
          } else  if(that.firstMeasurement){
            that.firstMeasurement = false;
          }

          that.currentValues.temp = parsedData[0] / recvConfig.send_multiply.temp;
          that.currentValues.pre = parsedData[1] / recvConfig.send_multiply.pre;
          that.currentValues.gpslat = parsedData[2] / recvConfig.send_multiply.gpslat;
          that.currentValues.gpslong = parsedData[3] / recvConfig.send_multiply.gpslong;
          that.currentValues.id = parsedData[4];
          if(!that.firstMeasurement){
            that.previusTime = that.currentTime;
            that.currentTime = now;
            that.intervalTime = that.currentTime - that.previusTime;
            that.previusAltitude = that.currentValues.altitude;

            that.currentValues.altitude = hCalculator(that.currentValues.pre);
            that.movedDistance = that.currentValues.altitude - that.previusAltitude;
            that.movedVelocity = that.movedDistance / that.intervalTime * 1000;
          } else {
            that.currentTime = now;
            that.currentValues.altitude = hCalculator(that.currentValues.pre);
          }

          that.emit("receivedValue", {
            "name": "temp",
            "time": now,
            "value": that.currentValues.temp
          });
          that.emit("receivedValue", {
            "name": "pre",
            "time": now,
            "value": that.currentValues.pre
          });
          that.emit("receivedValue", {
            "name": "gpslat",
            "time": now,
            "value": that.currentValues.gpslat
          });
          that.emit("receivedValue", {
            "name": "gpslong",
            "time": now,
            "value": that.currentValues.gpslong
          });
          that.emit("receivedValue", {
            "name": "id",
            "time": now,
            "value": that.currentValues.id;
          });
          that.emit("receivedValue", {
            "name": "alt",
            "time": now,
            "value": that.currentValues.altitude
          });

          if(!that.firstMeasurement){
            that.emit("receivedValue", {
              "name": "vvel",
              "time": now,
              "value": that.movedVelocity
            });
          }
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
