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

let send_counter;
class Receiver {
  static init(){
    var that = Receiver;
    that.connected = false;
    that.tty = recvConfig.tty;
    that.currentValues = {};
    that.callback = function (){};
    that.simulateFirstGPS();
    that.connect();
  }


  static updateCansatConfig(cfg){
    let that = Receiver;
    that.cansatConfig = cfg;
  }

  static sendCansatConfig(values){
    let that = Receiver;
    let output = [];
    that.cansatConfig = values;
    /*if(that.cansatConfig.parachute_open == true){
      _write("A");

    } else {
      _write("B");
    }*/
    /** **/
    //output[0] = (send_counter * 2 + 0) / 100;
    //output[1] = values.groundstation_presure * 100;
    //output[2] = values.groundstation_temp * 100;
    /*
    let txrt;
    if(values.tx_rate == true){
      txrt = 1.0;
    } else {
      txrt = -1.0
    }
    */
    //output[0] = values.parachute_program.value;
    //output[1] = values.parachute_height.value;
    //output[2] = values.command.value;
    //output[3] = txrt;
    //output[5] = values.parachute_servoStatus;
    //output[6] = values.calibrate_accelerometer;
    //that._send(output);
    //* *//
  }

  static _write(str){
    let that = Receiver;
    log("receiver-send", str)
    if(that.connected){
      that.port.write(str, function (err) {
        log("receiver", err)
      });
    } else {
      log("receiver", "can't send. connection not stablished to gs")
    }
  }

  static _send(array){
    let that = Receiver;
    let send = array.join(":") + ";";
    return that._write(send);
  }

  static on(callback){
    let that = Receiver;
    that.callback = callback;
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
      that.port.on("data", function(data){
        log("receiver", data);

        var parsedData = data.split(":");
        var now = new Date().getTime();

        if(parsedData.length === 12){ // Default telemetry
          let pd = parsedData;

          packetloss.registerID(parseInt(parseFloat(pd[1])));

          const packetTypes = 3;
          let send;
          //let packetType = Math.round(parseFloat(pd[1]) * 100) % packetTypes;

          let packetType = 0;
          if(packetType === 0){

            send = [
              {
                "name":"pbmp",
                "value":parseFloat(pd[1])
              },
              {
                "name": "tbmp",
                "value": parseFloat(pd[2])
              },
              {
                "name": "hbmp",
                "value": parseFloat(pd[3])
              },
              {
                "name": "hforbmp",
                "value": parseFloat(pd[4])
              },
              {
                "name": "tlm35",
                "value": parseFloat(pd[6])
              },
              {
                "name":"pmpx",
                "value": parseFloat(pd[7])
              },
              {
                "name":"hmpx",
                "value": parseFloat(pd[8])
              },
              {
                "name":"gpslat",
                "value": parseFloat(pd[9])
              },
              {
                "name":"gpslng",
                "value": parseFloat(pd[10])
              },
              {
                "name":"hgps",
                "value": parseFloat(pd[11])
              }
            ];

            let hrdr = parseFloat(pd[5]);
            if(hrdr != 0.0){
              send.push({
                "name":"hrdr",
                "value":hrdr
              });
            }
          }
          send.forEach(function (parameter) {
            that.callback(parameter.name, now, parameter.value);
          });
        } else if (parsedData.length === 2){
          log("cansat", parsedData[1]);
          var now = Date.now();
          that.callback("cansatMsg", now, parsedData[1]);
        } else {
          log("protocol", "no-valid values received: " + data);
          var now = Date.now();
          that.callback("cansatUnknown", now, data);
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
      "name": "gpslng",
      "time": now,
      "value": recvConfig.firstPos.lng
    });
  }
}


Receiver.init();

module.exports = Receiver;
