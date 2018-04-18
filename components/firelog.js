let firebase = require("./firebase.js");
const config = require(__dirname + '/../config.json');

module.exports = function (msg) {
  firebase.database().ref(sat_code + "/gsMessage").set(msg);
  console.log(msg);
}
