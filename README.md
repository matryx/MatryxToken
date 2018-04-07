# Matryx Token
A set of smart contracts that creates an ERC20 token for Matryx.

## Actual Mainnet MatryxToken Statistics:

```
Total Supply: 34,432,385.52 MTX
Name: MatryxToken
Symbol: MTX
Ether Raised: 12,382 ETH / ~$4 million (with a cost basis of $320/eth during the sale)
Contract Address: 0x0AF44e2784637218dD1D32A322D44e603A8f0c6A
```

*Note that Matryx burned 279,726,879.48 MTX tokens to the first thousand 0x addresses since we did not raise the full amount and it was the right thing to do for our participants. To view the burn transactions please see burnTransactions.txt file for the transaction hashes and see for yourself or visit etherscan. The Total Supply is actually 34,432,385.52 MTX after the burn. The previous total supply before the burn was 314,159,265 MTX.
An article summary is here: https://blog.matryx.ai/all-in-all-the-ins-and-outs-of-the-mtx-supply-3e5837b364e
Thank you.

## Default Code for Matryx Token
Default Supply
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

