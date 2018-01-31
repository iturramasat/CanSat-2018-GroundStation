var FirebaseClient = require('firebase-client');
const config = require("../config.json");
var firebase = new FirebaseClient({
  url: config.firebaseUrl,
  auth: ""
});

setInterval(function () {

}, 2000);


module.exports = firebase;
