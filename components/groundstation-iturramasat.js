/*

  Custom protocol based in ITURRAMASAT PROTOCOL.

*/

var EventEmitter = require('events').EventEmitter;
var log = require(__dirname + "/consolelog.js").log;
var config = require(__dirname + '/config.json');
var SerialPort = require('serialport');
var parsers = SerialPort.parsers;
var recvConfig = config.iturramasat_receiver;
var hCalculator = require(__dirname + "/altitude_calculator.js");

class Receiver extends EventEmitter {
  constructor(){
    super();
    var self = this;
    self.connected = false;
    self.tty = recvConfig.tty;
    self.currentValues = {};
    self.simulateFirstGPS();
  }

  connect(){
    var self = this;
    if(self.connected){
      log("receiver", "Already connected to the GroundStation");
      return false;
    }

    self.port = new SerialPort(self.tty, {
      baudRate:recvConfig.baudrate,
      parser:SerialPort.parsers.readline(';')
    });
    self.port.on("error", function (error) {
      log("serial", error);
    })
    self.port.on("open", function(){
      log("receiver", "Successfully connected to the receiver");
      self.connected = true;
      self.emit("receiverConnectionChange", {
        "connected": true,
        "tty": self.tty
      });
      self.port.write("Ping!");
      self.port.on("data", function(data){
        log("receiver", data);

        var parsedData = data.split(":");
        var now = new Date().getTime();

        if(parsedData.length === 4){
          if(typeof self.firstMeasurement == "undefined"){
            self.firstMeasurement = true;
          } else  if(self.firstMeasurement){
            self.firstMeasurement = false;
          }

          self.currentValues.temp = parsedData[0] / recvConfig.send_multiply.temp;
          self.currentValues.pre = parsedData[1] / recvConfig.send_multiply.pre;
          self.currentValues.gpslat = parsedData[2] / recvConfig.send_multiply.gpslat;
          self.currentValues.gpslong = parsedData[3] / recvConfig.send_multiply.gpslong;

          if(!self.firstMeasurement){
            self.previusTime = self.currentTime;
            self.currentTime = now;
            self.intervalTime = self.currentTime - self.previusTime;
            self.previusAltitude = self.currentValues.altitude;

            self.currentValues.altitude = hCalculator(self.currentValues.pre);
            self.movedDistance = self.currentValues.altitude - self.previusAltitude;
            self.movedVelocity = self.movedDistance / self.intervalTime * 1000;
          } else {
            self.currentTime = now;
            self.currentValues.altitude = hCalculator(self.currentValues.pre);
          }

          self.emit("receivedValue", {
            "name": "temp",
            "time": now,
            "value": self.currentValues.temp
          });
          self.emit("receivedValue", {
            "name": "pre",
            "time": now,
            "value": self.currentValues.pre
          });
          self.emit("receivedValue", {
            "name": "gpslat",
            "time": now,
            "value": self.currentValues.gpslat
          });
          self.emit("receivedValue", {
            "name": "gpslong",
            "time": now,
            "value": self.currentValues.gpslong
          });
          self.emit("receivedValue", {
            "name": "alt",
            "time": now,
            "value": self.currentValues.altitude
          });

          if(!self.firstMeasurement){
            self.emit("receivedValue", {
              "name": "vvel",
              "time": now,
              "value": self.movedVelocity
            });
          }
        } else if (parsedData.length === 2){
          log("cansat", parsedData[1]);
          var now = Date.now();
          self.emit("receivedValue", {
            "name": "cansatMsg",
            "time": now,
            "value": parsedData[1]
          });
        } else {
          log("protocol", "no-valid values received: " + data);
          var now = Date.now();
          self.emit("receivedValue", {
            "name": "cansatUnknown",
            "time": now,
            "value": data
          });
        }
      })
    });
  }

  simulateFirstGPS(){
    var self = this;
    var now = Date.now();
    log("receiver", "simulating first GPS coords..");
    self.emit("receivedValue", {
      "name": "gpslat",
      "time": now,
      "value": recvConfig.firstPos.lat
    });
    self.emit("receivedValue", {
      "name": "gpslong",
      "time": now,
      "value": recvConfig.firstPos.lng
    });
  }
}

module.exports = Receiver;
