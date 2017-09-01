'use strict';

import expectThrow from './helpers/expectThrow';
var MintableToken = artifacts.require('./MatryxToken.sol');
var MigrationTarget = artifacts.require('./TestMigrationTarget.sol');

contract('MatryxToken', function(accounts) {
  let token;
  let migration;

  // beforeEach(async function() {
  //   token = await MintableToken.new();
  // });

  it('should have correct vanity labels', async function() {
  	token = await MintableToken.new();

    let name = await token.name.call()
    let symbol = await token.symbol.call()
    let decimals = await token.decimals.call()

    assert.equal(name, 'MatryxToken')
    assert.equal(symbol, 'MTX')
    assert.equal(decimals, 18)
  });

  it('should start with a totalSupply of 0', async function() {
    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply, 0);
  });

  it('should return mintingFinished false after construction', async function() {
    let mintingFinished = await token.mintingFinished();

    assert.equal(mintingFinished, false);
  });

  it('should mint a given amount of tokens to a given address', async function() {
    const result = await token.mint(accounts[0], 100);
    assert.equal(result.logs[0].event, 'Mint');
    assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
    assert.equal(result.logs[0].args.amount.valueOf(), 100);
    assert.equal(result.logs[1].event, 'Transfer');
    assert.equal(result.logs[1].args.from.valueOf(), 0x0);

    let balance0 = await token.balanceOf(accounts[0]);
    assert(balance0, 100);
    
    let totalSupply = await token.totalSupply();
    assert(totalSupply, 100);
  })
  it('should fail to mint after call to finishMinting', async function () {
    await token.finishMinting();
    assert.equal(await token.mintingFinished(), true);
  })

  // test upgradeable token
  it('token has correct upgrade agent', async function() {
    let agent = await token.upgradeMaster.call()
    assert.equal(agent, accounts[0], 'incorrect upgrade agent set in constructor')
  })
  it('should deploy new upgradable token', async function() {
    migration = await MigrationTarget.new(token.address);
    let originalSupply = await migration.originalSupply.call()
    assert(originalSupply, 100, 'New token did not get correct orginalSupply')

    let isAgent = await migration.isUpgradeAgent.call()
    assert(isAgent, true)

    let oldToken = await migration.oldToken.call()
    assert(oldToken, token.address)

  })
  it('token should be able to upgrade', async function() {
    let isUpgradable = await token.canUpgrade.call()
    assert(isUpgradable, true)

    let waitingAgent = await token.getUpgradeState.call()
    assert(waitingAgent.toString(), 2)
  })
  it('should set an upgrade agent', async function() {
    await token.setUpgradeAgent(migration.address, {from: accounts[0]})
    let ready = await token.getUpgradeState.call()
    assert(ready.toString(), 3)
  })
  it('only owner can set upgrade', async function() {
    await token.setUpgradeAgent(migration.address, {from: accounts[1]})
    let agent = await token.upgradeAgent.call()
    assert(agent, migration.address)
  })
  it('should upgrade tokens', async function() {
    await token.upgrade(50)
    let tokenSupply = await token.totalSupply.call()
    assert(tokenSupply, 50)

    let newTokenSupply = await migration.totalSupply.call()
    assert(tokenSupply, 50)

    let state = await token.getUpgradeState.call()
    assert(state.toString(), 4)

    let upgraded = await token.totalUpgraded.call()
    assert(upgraded, 50)

    let tokenBal = await token.balanceOf.call(accounts[0])
    let newTokenBal = await migration.balanceOf.call(accounts[0])
    assert(tokenBal, 50)
    assert(newTokenBal, 50)
  })
  it('cant upgrade too much', async function() {
    await token.upgrade(50)
    let tokenSupply = await token.totalSupply.call()
    assert(tokenSupply, 50)
  })
  it('Upgrade agent cannot be changed after the ugprade has begun', async function() {
    await token.setUpgradeAgent(token.address, {from: accounts[0]})
    let owner = await token.upgradeAgent.call()
    assert(owner, migration.address)
  })
});
