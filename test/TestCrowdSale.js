'use strict'

import BigNumber from 'bignumber.js'

const Crowdsale = artifacts.require("./TestCrowdsale.sol")
const Token = artifacts.require("./MatryxToken")

let inst
let token
let presale
let start
let end
let crowdsaleAddy

// token balances
let a0Balance
let a1Balance
// supply 
let tSupply
let wieSupply
let pt
let tt

// tier one purchase wei
const n1 = new BigNumber(75*Math.pow(10, 18))
// tier two purchase wei
const n2 = new BigNumber(150*Math.pow(10, 18))
// tier three purchase wei
const n3 = new BigNumber(300*Math.pow(10, 18))
// tier whitelistmpurchase wei
const n4 = new BigNumber(20000)
// regular sale purchase wei
const n5 = new BigNumber(1*Math.pow(10, 18))
// presale wei cap
const p = new BigNumber(809015*Math.pow(10, 17))
// sale wei cap
const t = new BigNumber(161803*Math.pow(10, 18))

contract('Crowdsale', function(accounts) {
  it("Crowdsale & Token deployed", async function() {
    inst = await Crowdsale.new()
    token = Token.at(await inst.token())
    tSupply = await token.totalSupply.call()
    crowdsaleAddy = inst.address
    // assert totalSupply init to 0
    assert.equal(tSupply, 0, "totalSupply not initilized correctly")
  })

  it("Crowdsale has correct owner", async function(){
    var owner = await inst.owner.call()
    assert.equal(owner, accounts[0])
  })

  it("token has correct owner", async function(){
    var tokenOwner = await token.owner.call()
    // assert token is owned by crowdsale contract
    assert.equal(tokenOwner, crowdsaleAddy)
  })

  it("sets the timestamps", async function(){
    presale = new Date().getTime() + 1
    start = new Date().getTime() + 2
    end = new Date().getTime() + 3

    await inst.setTime(presale, start, end)
    let time = await inst.presaleStartTime.call()
    assert.equal(time, presale, "presale time not set correctly")
    end = new Date().getTime()
    await inst.setEndsAt(end)
    let endTime = await inst.endTime.call()
    assert.equal(end, endTime, "end time not set correctly")

    // assert only owner can change end time
    let _end = new Date().getTime() + 1337
    await inst.setEndsAt(_end, {from: accounts[1]})
    endTime = await inst.endTime.call()
    assert.equal(end, endTime, "non owner called end time")
  })

  it("updates the presale whitelist", function() {
    var watcher = inst.Whitelisted()
    return inst.updateWhitelist(accounts[1], {from: accounts[0]}).then(function(tx) {
      return watcher.get()
    }).then(function(e){
      assert.equal(e.length, 1);
      assert.isTrue(e[0].args.status)
      assert.equal(e[0].args.addr, accounts[1])
      return inst.whitelist(accounts[1])
    }).then(function(listed){
      assert.isTrue(listed)
    })
  })

  it("can't buy before presale time", async function() {
    presale = new Date().getTime() + 10000
    presale = Math.floor(presale / 1000)

    await inst.buy({from: accounts[0], value: 20000})
    let raised = await inst.weiRaised.call()
    // assert weiRaiser = 0
    assert.equal(raised, 0, "wei raised is incorrect")

    tSupply = await token.totalSupply.call()
    // assert total supply = 0
    assert.equal(tSupply, 0, "whitelist presale buy not correct")

    let purchased = await token.balanceOf(accounts[0])
    // assert total = 0
    assert.equal(purchased, 0, "purchaser balance presale buy not correct")
  })

  it("can't buy presale low value non-whitelist purchase", async function() {
    presale = new Date().getTime()
    presale = Math.floor(presale / 1000)
    start = new Date().getTime() + 10000
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000
    end = Math.floor(end / 1000)

    await inst.setTime(presale, start, end)
    await inst.buy({from: accounts[0], value: 20000})
    let raised = await inst.weiRaised.call()
    // assert weiRaiser = 0
    assert.equal(raised, 0, "can't presale buy not correct")
  })

  it("halts payments in an emergency", async function() {
    presale = new Date().getTime() - 10000000
    presale = Math.floor(presale / 1000)
    start = new Date().getTime() + 10000000
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000000
    end = Math.floor(end / 1000)

    await inst.setTime(presale, start, end)
    await inst.halt({from: accounts[0]})
    await inst.buy({from: accounts[1], value: 20000})
    let raised = await inst.weiRaised.call()
    // assert wei raised is 0
    assert.equal(raised.toNumber(), 0, "halted wei presale purchase did not issue correct amount")

    await inst.unhalt({from: accounts[0]})
    let halted = await inst.halted.call()
    // assert halted is false now
    assert.equal(halted, false, "could not unhalt crowdsale")
  })

  it("can buy presale whitelist purchase", async function() {
    presale = new Date().getTime() - 10000000
    presale = Math.floor(presale / 1000)
    start = new Date().getTime() + 10000000
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000000
    end = Math.floor(end / 1000)

    await inst.setTime(presale, start, end)
    await inst.buy({from: accounts[1], value: 20000})
    let raised = await inst.weiRaised.call()
    // assert weiRaised = 20000
    assert.equal(raised.toNumber(), 20000, "whitelist presale purchase did not issue correct amount")
    tSupply = await token.totalSupply.call()
    // assert total supply = 20000 * 1456
    assert.equal(tSupply.toNumber(), 20000*1456, "halted wei presale purchase did not issue correct amount")
    
    a1Balance = await token.balanceOf(accounts[1])
    // assert total = 20000 * 1456
    assert.equal(a1Balance.toNumber(), (20000*1456), "20000 wei presale purchase did not issue correct amount")
  })

  it("only owner can mint", async function() {
    await token.mint(crowdsaleAddy, 20000, {from: accounts[0]})
    tSupply = await token.totalSupply.call()
    // assert total supply = 20000 * 1456
    assert.equal(tSupply.toNumber(), 20000*1456, "direct minting purchase did not issue correct amount")
  })

  it("can buy presale tier one purchase", async function() {
    await inst.buy({from: accounts[0], value: 75*Math.pow(10, 18)})
    let raised = await inst.weiRaised.call()
    // assert weiRaised = 20000 + 75 eth
    assert.equal(raised.toNumber(), 20000 + 75*Math.pow(10, 18), "tier one presale purchase did not issue correct amount")    
    tSupply = await token.totalSupply.call()
    a0Balance = await token.balanceOf(accounts[0])
    // assert total = 75 eth * 1164 + 20000 wei * 1164
    var sum = a0Balance.plus(a1Balance)
    assert.equal(tSupply.toString(10), sum.toString(10), "75 eth purchase did not issue correct amount")
  })

  it("can buy presale tier two purchase", async function() {
    await inst.buy({from: accounts[0], value: 150*Math.pow(10, 18)})
    let raised = await inst.weiRaised.call()
    // asset weiRaised = 20000 + 75 eth + 150 eth
    let s = n1.plus(n2)
    s = s.plus(n4)
    assert.equal(raised.toString(10), s.toString(10), "tier one presale purchase did not issue correct amount")

    tSupply = await token.totalSupply.call()
    a0Balance = await token.balanceOf(accounts[0])
    // assert total = 75 eth * 1164 + 150 eth * 1294
    var sum = a0Balance.plus(new BigNumber(20000*1456))
    assert.equal(tSupply.toString(10), sum.toString(10), "150 eth purchase did not issue correct amount")    
  })

  it("can buy presale tier three purchase", async function() {
    await inst.buy({from: accounts[0], value: 300*Math.pow(10, 18)})
    let raised = await inst.weiRaised.call()
    // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth
    var s = n1.plus(n2).plus(n3).plus(n4)
    assert.equal(raised.toString(10), s.toString(10), "tier one presale purchase did not issue correct amount")    

    tSupply = await token.totalSupply.call()
    a0Balance = await token.balanceOf(accounts[0])
    // assert total = 75 eth * 1164 + 150 eth * 1294 + 300 eth * 1371
    var sum = a0Balance.plus(new BigNumber(20000*1456))
    assert.equal(tSupply.toString(10), sum.toString(10), "150 eth purchase did not issue correct amount")    
  })

  it("has correct purchaser count", async function() {
    let purchased = await inst.purchaserCount.call()
    assert(purchased.toNumber(), 2)
  })


  it("can buy up to the presale cap", async function() {
    let raised = await inst.weiRaised.call()
    pt = p.minus(raised)
    await inst.buy({from: accounts[1], value: pt})
    raised = await inst.weiRaised.call()
    assert(raised.toString(10), p.toString(10))

    let bal = await token.balanceOf(accounts[1])
    assert(bal, new BigNumber(20000*1456).plus(pt.mul(1456)))
  })

  it("can't buy if presale cap is reached", async function() {
    let events = inst.allEvents();
    await inst.buy({from: accounts[0], value: 1})
    let raised = await inst.weiRaised.call()
    // assert weiRaised = presale total
    assert.equal(raised.toString(10), p.toString(10), "presale cap reached purchase did not issue correct amount")
    
    tSupply = await token.totalSupply.call()
    let purchased = await token.balanceOf(accounts[0])
    // assert total = 75 eth * 1164 + 150 eth * 1294 + 300 eth * 1371
    var amount = web3.fromWei(purchased.toNumber())
    assert.equal(amount, (75*1164)+(150*1294)+(300*1371), "over cap eth purchase did not issue correct amount")
    var test = pt
    test = test.mul(1456)
    test = test.plus(n1.mul(1164)).plus(n2.mul(1294)).plus(n3.mul(1371)).plus(n4.mul(1456))
    // assert total tokens = 75 eth * 1164 + 150 eth * 1294 + 300 eth * 1371 + remaining wei * 1456
    assert.equal(tSupply.toString(10), test.toString(10), "totalSupply incorrect")
  })

  it("can buy regular sale purchase", async function() {
    presale = new Date().getTime() - 10000000
    presale = Math.floor(presale / 1000)
    start = new Date().getTime()
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000000
    end = Math.floor(end / 1000)

    await inst.setTime(presale, start, end)
    await inst.buy({from: accounts[0], value: 1*Math.pow(10, 18)})
    let raised = await inst.weiRaised.call()
    // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth + 1 eth + presale cap difference
    var s = n1.plus(n2).plus(n3).plus(n4).plus(n5).plus(pt)
    assert.equal(raised.toString(10), s.toString(10), "presale cap reached purchase did not issue correct amount")    

    tSupply = await token.totalSupply.call()
    let purchased = await token.balanceOf(accounts[0])
    // assert total = 50 eth * 2164 + 100 eth * 3164
    var amount = web3.fromWei(purchased.toNumber())
    assert.equal(amount, (75*1164)+(150*1294)+(300*1371)+1164, "1 eth purchase did not issue correct amount")
  })

  it("can buy up to the sale cap", async function() {
    let raised = await inst.weiRaised.call()
    tt = t.minus(raised)
    await inst.buy({from: accounts[1], value: tt})
    raised = await inst.weiRaised.call()
    assert(raised.toString(10), t.toString(10))

    let bal = await token.balanceOf(accounts[1])
    assert(bal, new BigNumber(20000*1456).plus(tt.mul(1164)).plus(pt.mul(1456)))
  })

  it("can't buy if sale cap is reached", async function() {
    await inst.buy({from: accounts[0], value: 1})
    let raised = await inst.weiRaised.call()
    // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth + 1 eth + presale cap difference + sale cap
    var s = n1.plus(n2).plus(n3).plus(n4).plus(n5).plus(pt).plus(tt)
    assert.equal(raised.toString(10), s.toString(10), "sale cap reached purchase did not issue correct amount")

    tSupply = await token.totalSupply.call()
    let purchased = await token.balanceOf(accounts[0])
    // assert total = 50 eth * 2164 + 100 eth * 3164
    var amount = web3.fromWei(purchased.toNumber())
    assert.equal(amount, (75*1164)+(150*1294)+(300*1371)+1164, "over cap eth purchase did not issue correct amount")
  })

  it("can't buy after sale end time", async function() {
    end = new Date().getTime()
    end = Math.floor(end / 1000)

    await inst.setTime(presale, start, end)
    await inst.buy({from: accounts[0], value: 20000})
    let raised = await inst.weiRaised.call()
    // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth + 1 eth + presale cap difference + sale cap
    var s = n1.plus(n2).plus(n3).plus(n4).plus(n5).plus(pt).plus(tt)
    assert.equal(raised.toString(10), s.toString(10), "presale cap reached purchase did not issue correct amount")  

    let purchased = await token.balanceOf(accounts[0])
    var amount = web3.fromWei(purchased.toNumber())
    assert.equal(amount, (75*1164)+(150*1294)+(300*1371)+1164, "after time end did not issue correct amount")    
  })

  it("owner can finalize", function() {
    return inst.finalize({from: accounts[0]}).then(function(res) {
      return inst.isFinalized.call()
    }).then(function(final) {
      assert.equal(final, true, "Finalized was not set to true when called")
      return token.totalSupply.call()
    }).then(function(total) {
      // assert final supply equals pi
      assert.equal(web3.fromWei(total.toNumber()), 314159265, "Finalize did not issue correct tokens")
      return token.mintingFinished.call()
    }).then(function(doneMinting) {
      assert.equal(doneMinting, true, "finished minting was not set correctly")
      return token.owner.call()
    }).then(function(owner) {
      // assert that the token is now owned by master account
      assert.equal(owner, accounts[0], "ownership was not transferred correctly")
      return token.balanceOf(accounts[0])
    }).then(function(bal) {
      // assert that the owner remaining ~40% of tokens were issued in finalization.
      assert(web3.fromWei(bal.toNumber()), 107705112.5)
    })
  })
})
