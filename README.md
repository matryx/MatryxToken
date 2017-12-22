## Matryx Token

```
Total Supply: 314,159,265 MTX
Name: MatryxToken
Symbol: MTX
Ether Cap: 161,803 Eth
```

## Requirements

npm/node
eth testrpc
truffle

## Install

```npm i```

## Compile Contracts

```truffle compile```

## Deploy Contracts

Set unix epoch for start and end time

```truffle migrate```

## Test

run via npm script

`npm run test`

or

install testrpc

```
npm install -g ethereumjs-testrpc

```

Run testrpc chain

ex
```
testrpc -b 1.5 --account="0xc7dcd9e96b41cb0f5d3d519550966fc36e9472f92be7d16af3638e600a48d588,2000000000000000000000000" --account="0xb6485e6830a5d9aff97fa9d799c16aa9e387a2eea684c4b7d2c9f656798e2710,15000000000000000000000000"
```

set test bool to true in /migrations/2_deploy_contracts.js
run truffle tests

```truffle test```

