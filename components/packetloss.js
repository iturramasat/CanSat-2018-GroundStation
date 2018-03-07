let ids = [];

class Packetloss {
  static registerID(id){
    let that = Packetloss;
    ids.push(registerID);
    that.cleanOldIds();
  }

  static cleanOldIDs(){
    let that = Packetloss;
    ids = ids.slice(0 - maxIDS, ids.lenght);
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
    let received = 20 / difference;
    return received;
  }

  static calculatePacketLoss(){
    let that = Packetloss;
    return 1 - that.calculateReceived();
  }
}
