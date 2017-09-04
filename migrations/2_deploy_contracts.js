var MatryxToken = artifacts.require('./MatryxToken.sol')
var Crowdsale = artifacts.require('./Crowdsale.sol')
var TestCrowdsale = artifacts.require('./TestCrowdsale.sol')

var test = true;

// test constructor args manually
const _presaleStartTime = 1506399909
const _startTime = 1508991909
const _endTime = 1511673909
const _wallet = "0x01da6F5F5C89F3a83CC6BeBb0eAFC1f1E1c4A303"

module.exports = function(deployer) {
  if(test) {
  	MatryxToken.new().then(function(res) {
  	  deployer.deploy(TestCrowdsale, _presaleStartTime, _startTime, _endTime, _wallet, res.address)
  	})
  } else {
    //deployer.deploy(Crowdsale, 1504052905, 1504056025, 1504059625, "0x0040077926585455c40ceA126B37bED392aCa8C2")
	MatryxToken.new().then(function(res) {
	  deployer.deploy(Crowdsale, 1504062025, 1504062925, 1504063825, "0x0040077926585455c40ceA126B37bED392aCa8C2", res.address)
	})
  }
};
