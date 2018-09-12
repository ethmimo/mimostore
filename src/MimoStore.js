const EventStore = require('orbit-db-eventstore');
const EthCrypto = require('eth-crypto');
const Web3 = require('web3');

class MimoStore extends EventStore {

  /**
   * Instantiates a MimoStore
   *
   * @param     {IPFS}      ipfs            An IPFS instance
   * @param     {String}    dbname          The DB name, should be same as ENS name
   * @param     {Web3}      options.web3    A Web3 provider instance
   * @return    {MimoStore}                 self
   */
  constructor(ipfs, id, dbname, options) {
    if(!options) options = {};
    this.type = MimoStore.type;
    if (options.web3 instanceof Web3) this.ens = options.web3.eth.ens;
    super(ipfs, id, dbname, options);
  }

  /**
   * Add data to the DB
   *
   * @param     {Object}    data         The data we want to add
   * @param     {String}    sig          A valid signature of the data by the owner
   */
  add(data, sig) {
    if (!sig) throw new Error('A signature must be included');
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
    return this.recover(data, sig) == this.owner; // TODO: Is this how to call owner?
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
    return this.ens.registry.owner(this.dbname);
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
