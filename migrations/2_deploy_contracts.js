var MatryxToken = artifacts.require('./MatryxToken.sol')

module.exports = function(deployer) {
    return deployer.deploy(MatryxToken);
};