var FirebaseClient = require('firebase-client');
var firebase = new FirebaseClient({
  url: "https://iturramasat-cfb32.firebaseio.com/",
  auth: ""
});

module.exports = firebase;
