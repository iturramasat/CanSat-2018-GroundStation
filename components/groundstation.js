const SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const config = require("../config.json");
const emitter = require('central-event');

class GS {
  static _emit(evt, value){
    var that = GS;
    emitter.emit(evt, value);
  }

  static on(callback){
    let that = GS;
    that.callback = callback;
  }

  static sendCansatConfig(a){

  }
}

setInterval(function () {

  send = [{
      "name":"pbmp",
      "value":50
    }];

  send.forEach(function (parameter) {
    GS.callback(parameter.name, Date.now(), parameter.value);
  });
  console.log("emitted");
}, 1000);

module.exports = GS;
