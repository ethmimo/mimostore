const EventStore = require('orbit-db-eventstore');
const EthCrypto = require('eth-crypto');

class MimoStore extends EventStore {

  /**
   * Instantiates a MimoStore
   *
   * @param     {IPFS}      ipfs        An IPFS instance
   * @param     {String}    dbname      The name of your database (should be the same as your ENS name)
   * @param     {String}    dbowner     The Ethereum account that owns this DB
   * @return    {MimoStore}             self
   */
  constructor(ipfs, id, dbname, dbowner, options) {
    if(!options) options = {};
    super(ipfs, id, dbname, options);
    this._type = MimoStore.type;
    this.owner = dbowner;
  }

  /**
   * Add data to the DB
   *
   * @param     {Object}    data         The data we want to add
   * @param     {String}    sig          A valid signature of the data by the owner
   */
  add(data, sig) {
    if (!didOwnerSign(data, sig)) throw new Error('Owner did not authorize this');
    super.add(data);
  }

  /**
   * Checks if data has been signed by the owner
   *
   * @param     {Object}    data         The data we signed
   * @param     {String}    sig          A signature of the data
   * @returns   {Boolean}                Was the data signed by the owner?
   */
  didOwnerSign(data, sig) {
    return this.recover(data, sig) == this.owner;
  }

  /**
   * Recovers the signer of the data
   *
   * @param     {Object}    data         The data we signed
   * @param     {String}    sig          A signature of the data
   * @returns   {String}                 The Ethereum address that signed the data
   */
  recover(data, sig) {
    EthCrypto.recover(sig, EthCrypto.hash.keccak256(JSON.stringify(data)));
  }

  /**
   * Get the name of the database
   *
   * @returns   {String}                 The name of the database, same as ENS name
   */
  get ensname() {
    return this.dbname;
  }

  /**
   * Get the owner of the database
   *
   * @returns   {String}                 The owner of the ENS name and DB (an Ethereum address)
   */
  get owner() {
    return this.owner;
  }

  /**
   * Get the type of the database
   *
   * @returns   {String}                 The type of the DB, returns 'mimo'
   */
  static get type() {
    return 'mimo';
  }
}

module.exports = MimoStore;
