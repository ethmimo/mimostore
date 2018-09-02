const EventStore = require('orbit-db-eventstore');
const EthCrypto = require('eth-crypto');

class MimoStore extends EventStore {
  constructor(ipfs, id, dbname, dbowner, options) {
    if(!options) options = {};
    super(ipfs, id, dbname, options);
    this._type = MimoStore.type;
    this.owner = dbowner;
  }

  add(data, sig) {
    if (!didOwnerSign(data, sig)) throw new Error('Owner did not authorize this');
    else super.add(data);
  }

  get ensname() {
    return this.dbname;
  }

  get owner() {
    return this.owner
  }

  get didOwnerSign(data, sig) {
    return this.recover(data, sig) == this.owner;
  }

  recover(data, sig) {
    EthCrypto.recover(sig, EthCrypto.hash.keccak256(JSON.stringify(data)));
  }

  static get type() {
    return 'mimo';
  }
}

module.exports = MimoStore;
