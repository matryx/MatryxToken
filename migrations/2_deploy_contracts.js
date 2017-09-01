var MatryxToken = artifacts.require('./MatryxToken.sol')
var Crowdsale = artifacts.require('./Crowdsale.sol')
var TestCrowdsale = artifacts.require('./TestCrowdsale.sol')

var test = true;

module.exports = function(deployer) {
  if(test) {
  	deployer.deploy(TestCrowdsale)
  } else {
    //deployer.deploy(Crowdsale, 1504052905, 1504056025, 1504059625, "0x0040077926585455c40ceA126B37bED392aCa8C2")
	MatryxToken.new().then(function(res) {
	  deployer.deploy(Crowdsale, 1504062025, 1504062925, 1504063825, "0x0040077926585455c40ceA126B37bED392aCa8C2", res.address)
	})
  }
};
