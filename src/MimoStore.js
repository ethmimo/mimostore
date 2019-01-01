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
    this._type = MimoStore.type;
  }

  async set (signature, data) {
    throw new Error('set cannot be called directly');
  }

  /**
   * Delete an identity from the DB
   *
   * @param     {String}      address            The identity to be deleted
   * @param     {String}      signature          The signature approving the deletion of the identity
   */
  async del(address, signature) {
    const id = this.recover(signature, `delete profile: ${address}`);
    if (id != address) throw new Error('The provided Address and generated ID do not match');
    super.del(id);
  }

  /*** Add data to a profile
   *
   * @param     {String}    signature        A signature of the data
   * @param     {Object}    data             The new data to be added to the profile
   */
  async put(signature, data) {
    if (!(data instance of String)) throw new Error('Data must be included and be a string');
    if (!(signature instance of String)) throw new Error('A signature must be included');

    try {

      const id = this.recover(signature, data);
      const json = JSON.parse(data);

      let profile = await this.get(id);
      profile = Object.assign((profile == null ? {} : profile), json);
      return { id, super.put(id, profile) }; // TODO: will this work?

    } catch (e) {
      throw new Error(e);
    }

  }

  /**
   * Returns all profiles
   *
   * @returns   {Array}
   */
  all() {
    return Object.values(this._index._index);
  }

  /**
   * Returns all IDs
   *
   * @returns   {Array}
   */
  allIDs() {
    return Object.keys(this._index._index);
  }

  /**
   * Recovers the signer of the data
   *
   * @param     {String}    signature    A signature of the data
   * @param     {String}    data         The data we signed
   * @returns   {String}                 The Ethereum address that signed the data
   */
  recover(signature, data) {
    return EthCrypto.recover(signature, EthCrypto.hash.keccak256(data));
  }

  /**
   * Get the type of the database
   *
   * @returns   {String}                 The type of the DB, returns 'mimo'
   */
  static get type() {
    return 'mimostore';
  }
}

module.exports = MimoStore;
