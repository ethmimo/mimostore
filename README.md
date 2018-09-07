# mimo-orbit
Custom identity store on OrbitDB

An append-only log with traversable history. Add new claims about your identity to your DB. It uses digital signatures to ensure that all data added to the DB has been approved by the owner of the identity.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [License](#license)

## Install
```
npm install mimo-orbit
```

## Usage

First, create an instance of OrbitDB and Web3:

```javascript
const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const Web3 = require('web3')
const MimoStore = require('mimo-orbit')

const ipfs = new IPFS()
const web3 = new Web3()

// add custom type to orbitdb
OrbitDB.addDatabaseType(MimoStore.type, MimoStore)

// instantiate custom store
const orbitdb = new OrbitDB(ipfs)
const store = orbitdb.create(ensname, web3.eth.ens.registrar.owner(ensname), CustomStore.type)
```

Add a claim to it, if the signature of the data is a valid one then the data will be added successfully:

```javascript
store.add({ bio: 'I <3 Mimo' }, signature)
  .then(() => {
    const items = store.iterator().collect()
    items.forEach((e) => console.log(e.bio))
    // "I <3 Mimo"
  })
```

Later, when the database contains data, load the history and query when ready:

```javascript
store.events.on('ready', () => {
  const items = log.iterator().collect()
  items.forEach((e) => console.log(e.bio))
  // "I <3 Mimo"
})
```

## API

See [orbit-db's API Documenations](https://github.com/haadcode/orbit-db/blob/master/API.md#eventlogname) on eventlogs (the base class for MimoStore) for full details. The only difference between MimoStore and EventStore is its use of signatures for adding data.

## License

[MIT](LICENSE) © 2018 Ghilia Weldesselasie
