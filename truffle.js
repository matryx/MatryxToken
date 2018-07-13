require('babel-register')
require('babel-polyfill')


require('babel-polyfill');
require('babel-preset-env');
var fs = require('fs')
var path = require('path')
var mnemonic_path = path.join(__dirname, '..', 'keys', 'dev_wallet_mnemonic.txt')
var HDWalletProvider = require("truffle-hdwallet-provider");




getFileContents = function(path) {


  
  return fs.readFileSync(path).toString();
}

var test = true
var account
var mnemonic = ""

if(test){
  account = "0xdaa0e2ef627bfb864ed19efd546542f47e5ad6a7"
} else {
  account = "0x0040077926585455c40ceA126B37bED392aCa8C2"
}

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      from: account
    },
      ropsten:  {
        provider: function() {
            return new HDWalletProvider(getFileContents(mnemonic_path), "https://ropsten.infura.io/metamask")
        },
        network_id: 3,
        gas:   6741593
    }
  }
};

