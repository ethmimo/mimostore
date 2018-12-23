const KeyValueStore = require('orbit-db-kvstore');
const EthCrypto = require('eth-crypto');

class MimoStore extends KeyValueStore {

  /**
   * Instantiates a MimoStore
   *
   * @param     {IPFS}      ipfs            An IPFS instance
   * @param     {String}    dbname          The DB name, should be 'mimo'
   * @return    {MimoStore}                 self
   */
  constructor(ipfs, id, dbname, options) {
    super(ipfs, id, dbname, options);
    this.type = MimoStore.type;
  }

  set (data, signature) {
    throw new Error('set cannot be called directly');
  }

  /*** Add data to a profile
   *
   * @param     {Object}    data       The new data to be added to the profile
   * @param     {String}    signature        A signature of the data
   */
  put(data, signature) {
    if (!data) throw new Error('Data must be included');
    if (!data.name) throw new Error('A name must be included');
    if (!signature) throw new Error('A signature must be included');
    const signer = recover(data, signature);
    data.id = getID(data.name, signer);
    const profile = this.get(data.id);
    Object.assign(profile, data);
    super.put(data.id, profile);
  }

  del(name, signature) {
    const signer = recover('delete profile: ${name}', signature);
    const id = getID(name, signer);
    super.del(id);
  }

  /**
   * Check if a profile is registered
   *
   * @param     {Object}    data         The data we signed
   * @param     {String}    signature          A signature of the data
   * @returns   {Boolean}                Was the data signed by the owner?
   */
  isRegistered(name, owner) {
    const id = getID(name, owner);
    const profile = this.get(id);
    return profile != undefined;
  }

  /**
   * Get a profile's ID
   *
   * @param     {String}    name         The name of the profile
   * @param     {String}    owner        A public key
   * @returns   {String}                 The profile ID
   */
  getID(name, owner) {
    return EthCrypto.hash.keccak256(name + owner);
  }

  /**
   * Recovers the signer of the data
   *
   * @param     {Object}    data         The data we signed
   * @param     {String}    signature          A signature of the data
   * @returns   {String}                 The Ethereum address that signed the data
   */
  recover(data, signature) {
    if (data instanceof String) {
      EthCrypto.recover(signature, EthCrypto.hash.keccak256(data));
    } else {
      EthCrypto.recover(signature, EthCrypto.hash.keccak256(JSON.stringify(data)));
    }

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
