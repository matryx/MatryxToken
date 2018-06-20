require('babel-register')
require('babel-polyfill')

var test = true
var account

if(test){
  account = "0x606849bb8161f2d6de55c7d305af3f6408cacf2a"
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
    }
  }
};
