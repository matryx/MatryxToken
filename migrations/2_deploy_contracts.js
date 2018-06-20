var MatryxToken = artifacts.require('./MatryxToken.sol')
var Crowdsale = artifacts.require('./Crowdsale.sol')

var test = true;

// // test constructor args manually
// const _presaleStartTime = 1506399909
// const _startTime = 1508991909
// const _endTime = 1511673909
// const _wallet = "0x01da6F5F5C89F3a83CC6BeBb0eAFC1f1E1c4A303"

module.exports = function(deployer) {
deployer.deploy(MatryxToken)
};
