const DocumentStore = require('orbit-db-docstore');
const EthCrypto = require('eth-crypto');

class MimoStore extends DocumentStore {

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

  put (data) {
    throw new Error('put cannot be called directly');
  }

  /*** Add data to a profile
   *
   * @param     {String}    name         The name of the profile we want to register
   * @param     {String}    owner        The owner (address) of the profile
   */
  add(data, sig) {
    if (!data) throw new Error('Data must be included');
    if (!sig) throw new Error('A signature must be included');
    const signer = recover(data, sig);
    if (!isRegistered(data.name, signer)) throw new Error('Profile must be registered');
    data._id = getID(data.name, signer);
    delete data.registered_on;
    super.put(data);
  }

  /**
   * Register a profile
   *
   * @param     {String}    name         The name of the profile we want to register
   * @param     {String}    owner        The owner (address) of the profile
   */
  register(name, owner) {
    if (!(name instanceof String)) throw new Error('Name must be a string');
    if (!(owner instanceof String)) throw new Error('Owner must be a string');
    super.put({ _id: EthCrypto.hash.keccak256([name, owner]), name: name, registered_on: Date.now() });
  }

  /**
   * Check if a profile is registered
   *
   * @param     {Object}    data         The data we signed
   * @param     {String}    sig          A signature of the data
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
   * @param     {Object}    data         The data we signed
   * @param     {String}    sig          A signature of the data
   * @returns   {Boolean}                Was the data signed by the owner?
   */
  getID(name, owner) {
    return EthCrypto.hash.keccak256([name, owner]);
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
   * Get true owner
   *
   * @returns   {Object}                 The profile that is the true owner of a name
   */
  trueOwner(name) {
    // get all profiles with the name we're looking for
    const names = this.query((p)=> p.name == name));
    // get the earliest date that a profile with this name was registered on
    const earliestDate = Math.min(names.map(name => name.registered_on));
    // return that profile
    return this.query((p)=> p.registered_on == earliestDate));
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
