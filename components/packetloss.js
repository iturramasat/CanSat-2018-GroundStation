let ids = [];
const maxIDS = 20;
class Packetloss {
  static registerID(id){
    let that = Packetloss;
    ids.push(id);
    that.cleanOldIDs();
  }

  static cleanOldIDs(){
    let that = Packetloss;
    ids = ids.slice(-maxIDS - 1, ids.lenght);
  }

  /*
  static calculatePacketLoss(){
    let that = Packetloss;
    let min = Math.min.apply(null, ids);
    let max = Math.max.apply(null, ids);
    let difference = max - min;
    let received = 20 / difference;
    let packetLoss = 1 - received;
    return packetloss;
  }
  */

  static calculateReceived(){
    let that = Packetloss;
    let min = Math.min.apply(null, ids);
    let max = Math.max.apply(null, ids);
    let difference = max - min;
    //console.log(difference);
    let received = 20 / difference;
    return Math.max(0, received);
  }

  static calculatePacketLoss(){
    let that = Packetloss;
    return Math.max(0, 1 - that.calculateReceived());
  }
}

module.exports = Packetloss;
