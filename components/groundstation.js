const SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const config = require("../config.json");
const emitter = require('central-event');

class GS {
  static _emit(evt, value){
    var that = GS;
    emitter.emit(evt, value);
  }

}

setInterval(function () {
  GS._emit("receivedValue", {
    "name":"temp",
    "value": Math.round(Math.random()*100)
  });
  GS._emit("receivedValue", {
    "name":"presure",
    "value": Math.round(Math.random()*1000)
  });
  GS._emit("receivedValue", {
    "name":"heigth",
    "value": Math.round(Math.random()*2000)/10
  });
  GS._emit("receivedValue", {
    "name":"v_vel",
    "value": Math.round(Math.random()*200)/10
  });
}, 1000);

module.exports = GS;
