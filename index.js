const firebase = require("./components/firebase.js");
const gs = require("./components/groundstation-iturramasat.js");
const config = require(__dirname + '/config.json');
const emitter = require('central-event');

emitter.on("receivedValue", function (value) {
  firebase.update("/sats/" + config.sat_code + "/" + value.name, {value: value.value})
  .fail(function (error) {
    console.log(error);
  });
  console.log(value.name + " updated to value " + value.value);
});
