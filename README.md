# mimo-orbit
Custom identity store on OrbitDB

An key-value store refactored to accept digital signatures. Add new claims about your identity to the DB. It uses digital signatures to ensure that all data added to the DB has been approved by the owner of the identity.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [License](#license)

## Install
```
npm install mimostore
```

## Usage

First, create an instance of OrbitDB and Web3:

```javascript
const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const MimoStore = require('mimostore')

const ipfs = new IPFS()

// add MimoStore to orbitdb
OrbitDB.addDatabaseType(MimoStore.type, MimoStore)

// instantiate MimoStore
const orbitdb = new OrbitDB(ipfs)
const mimostore = orbitdb.create('mimo', MimoStore.type, {
  write: ['*']
})
```

Add a claim to it, if the signature of the data is a valid one then the data will be added successfully:

```javascript
await store.put({ id: '0x_id', bio: 'I <3 Mimo' }, '<signature>')
```

Later, when the database contains data, query whenever:

```javascript
await store.get('0x_id')
```

## API

See the commented code in the [codebase](src/MimoStore.js)

## License

[MIT](LICENSE) © 2018 Ghilia Weldesselasie
