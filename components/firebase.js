var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
const config = require("../config.json");
let fb = firebase.initializeApp({
  apiKey: "AIzaSyCHYGgKwK0k8v0dU8xqrlnj8gTqPdj2fKA",
  authDomain: "iturramasat-cfb32.firebaseapp.com",
  databaseURL: "https://iturramasat-cfb32.firebaseio.com",
  projectId: "iturramasat-cfb32",
  storageBucket: "iturramasat-cfb32.appspot.com",
  messagingSenderId: "644618549971"
});

setInterval(function () {

}, 2000);


module.exports = fb;
