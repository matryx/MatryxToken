var MatryxToken = artifacts.require('./MatryxToken.sol')
var Crowdsale = artifacts.require('./Crowdsale.sol')
//var TestCrowd = artifacts.require('./TestCrowd.sol')

module.exports = function(deployer) {
  //MatryxToken.new("0x0040077926585455c40ceA126B37bED392aCa8C2", "MatryxToken", "MTX", 18).then(function(res) {
  	//deployer.deploy(Crowdsale, 1503104439, 1503154839, "0x0040077926585455c40ceA126B37bED392aCa8C2")
  	//deployer.deploy(TestCrowd, 1503104439, 1503154839, "0x0040077926585455c40ceA126B37bED392aCa8C2", "0x0040077926585455c40ceA126B37bED392aCa8C2")
  //})
  deployer.deploy(Crowdsale, 1503118839, 1503154839, res.address, "0x0040077926585455c40ceA126B37bED392aCa8C2")
};
