const firebase = require("./components/firebase.js");
const gs = require("./components/groundstation-iturramasat.js");
const config = require(__dirname + '/config.json');

let socketLastUpdated = 0;
let values = {};
gs.on(function (name, time, value) {
  /*firebase.update("/sats/" + config.sat_code + "/" + name, {value: value})
  .fail(function (error) {
    console.log(error);
  });*/
  //console.log(name + " updated to value " + value);

  if(typeof values[name] == "undefined"){
    values[name] = {};
  }

  values[name].value = value;
  values[name].changed = Date.now();

});

var socket = require('socket.io-client')(config.socketServer);
console.log("connecting to " + config.socketServer);
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});

setInterval(function () {
  let send = [];
  Object.keys(values).forEach(function (name) {
    if(values[name].changed > socketLastUpdated){
      send.push({
        "name": name,
        "value": Math.round(values[name].value*100)/100
      });
    }
  });
  socket.emit("p", send);
  socketLastUpdated = Date.now();
}, 1000 / config.socketRefreshRate);

let firebaseCanSatConfig = firebase.database().ref("/sats/" + config.sat_code + "/config");
let cansatConfiguration = {};
firebaseCanSatConfig.on('value', function(snapshot) {
  let val = snapshot.val();
  cansatConfiguration = val;
  gs.sendCansatConfig(val);
});

setInterval(function () {
  gs.sendCansatConfig(cansatConfiguration);
  Object.keys(values).forEach(function (name) {
    firebase.database().ref("/sats/" + config.sat_code + "/" + name).set({
      value: values[name].value
    });
  });
}, 1000);
