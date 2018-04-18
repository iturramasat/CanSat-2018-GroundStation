const SerialPort = require('serialport');
const Delimiter = require('parser-delimiter')

const config = require(__dirname + '/../config.json');
const recvConfig = config["iturramasat_multireceiver"];
const debug = require("./firelog.js");
let antennas = {

}

class Receiver {
  static _getTTYs(){
    return "/dev/ttyUSB0"
  }

  static begin(){
    let that = Receiver;

    that.connectNewDevices();

    setInterval(that.connectNewDevices, 5000)
  }

  static connectNewDevices(){
    let that = Receiver;
    let ttys = that.getTTYs();

    ttys.forEach(function (tty) {
      if(typeof antennas[tty] !== "undefined"){
        that._openTTY(tty);
      }
    });
  }

  static _openTTY(tty){
    let antenna = {};
    if(typeof antennas[tty] !== "undefined"){
      debug("This tty (" + tty + ") is already open");
      return;
    }
    debug("openning tty " + tty)
    antenna.tty = tty;
    antenna.port = new SerialPort(tty, {
      baudRate: recvConfig.baudrate
    });
    antenna.parser = antenna.port.pipe(new Delimiter({ delimiter: recv.recvConfig }))
    antenna.parser.on("data", function (data) {
      that._parseValue(antenna.tty, data)
    });

    antenna.port.on("open", function () {
      antennas[tty] = antenna;
      debug("Openned connection with " + tty);
    });

    antenna.port.on("close", function () {
      delete antennas[tty];
      debug("Clossed connection with " + tty);
    });

    antenna.port.on("error", function (error) {
      debug(error);
    });
  }

  static _parseValue(data){
    let that = Receiver;
    let obj = data.split(":");
    if(obj.length === 8){
      let type = obj[0] % 4;
      let now = Date.now();
      if(type == 0){
        // And so on..
        that.emit("bmp", now, obj[1]);
        that.emit("bmp", now, obj[1]);
      }
    }
  }

  static emit(name, time, value){
    that.callbacks.forEach(function (callback) {
      callback(name, time, value)
    })
  }

  static on(callback){
    that.callbacks.push(callback)
  }
}
