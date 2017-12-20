const firebase = require("./components/firebase.js");
const gs = require("./components/groundstation.js");
const config = require(__dirname + '/config.json');
const emitter = require('central-event');

emitter.on("receivedValue", function (value) {
  firebase.update("/sats/a_sat/" + value.name, {value: value.value})
  .fail(function (error) {
    console.log(error);
  });
  console.log(value.name + " updated to value " + value.value);
});
