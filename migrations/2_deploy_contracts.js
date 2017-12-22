var MatryxToken = artifacts.require('./MatryxToken.sol')
var Crowdsale = artifacts.require('./Crowdsale.sol')

var test = true;

var accounts;
web3.eth.getAccounts(function(err,res) { accounts = res; });
console.log(web3.eth.getBlock('latest').timestamp);

// test constructor args manually
const searchFactor = 1363258571
const _presaleStartTime = 1506399909 + searchFactor
const _startTime = 1508991909 + searchFactor
const _endTime = 1511673909 + searchFactor

module.exports = function(deployer) {
  if(test) {
  	MatryxToken.new().then(function(res) {
  	  deployer.deploy(Crowdsale, _presaleStartTime, _startTime, _endTime, accounts[0], res.address)
  	})
  } else {
    //deployer.deploy(Crowdsale, 1504052905, 1504056025, 1504059625, "0x0040077926585455c40ceA126B37bED392aCa8C2")
	MatryxToken.new().then(function(res) {
	  deployer.deploy(Crowdsale, 1504062025, 1504062925, 1504063825, accounts[0], res.address)
	})
  }
};