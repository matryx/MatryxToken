require('babel-register')
require('babel-polyfill')

var test = true
var account

if(test){
  account = "0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303"
} else {
  account = "0x0040077926585455c40ceA126B37bED392aCa8C2"
}

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 10000000
    }
  }
};
