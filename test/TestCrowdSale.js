var BigNumber = require('bignumber.js');
var Crowdsale = artifacts.require("./TestCrowdsale.sol")
var Token = artifacts.require("./MatryxToken")

var inst
var token
var presale
var start
var end
var crowdsaleAddy

var a0Balance
var a1Balance
var tSupply
var wieSupply

contract('Crowdsale', function(accounts) {
  // Token Tests
  it("Crowdsale & Token deployed", function() {
    return Crowdsale.deployed().then(function(instance){
      crowdsaleAddy = instance.address
      inst = instance
      return instance.token()
    }).then(function(address){
      Token.at(address).then(function(instance) {
        token = instance;
        return token.totalSupply.call()
      }).then(function(total) {
        // assert totalSupply init to 0
        assert.equal(total, 0, "totalSupply not initilized correctly")
        return token.name.call().then(function(name){
          // assert vanity variable is set
          assert.equal(name, "MatryxToken", "vanity variable not set correctly")
        })
      })
    })
  })
  it("Crowdsale has correct owner", function(){
    return inst.owner.call().then(function(owner){
      assert.equal(owner, accounts[0])
    })
  })
  it("token has correct owner", function(){
    return token.owner.call().then(function(owner){
      // assert token is owned by crowdsale contract
      assert.equal(owner, crowdsaleAddy)
    })
  })
  it("sets the timestamps", function(){
    presale = new Date().getTime() + 1
    start = new Date().getTime() + 2
    end = new Date().getTime() + 3

    return inst.setTime(presale, start, end).then(function(){
      return inst.presaleStartTime.call()
    }).then(function(time) {
      // assert presale 
      assert.equal(time, presale, "presale time not set correctly")
    })
  })
  // CrowdSale Tests
  it("updates the presale whitelist", function() {
    return inst.updateWhitelist(accounts[1], {from: accounts[0]}).then(function(tx) {
      return inst.whitelist(accounts[1])
    }).then(function(listed){
      assert.isTrue(listed)
    })
  })
  it("can't buy before presale time", function() {
    presale = new Date().getTime() + 10000
    presale = Math.floor(presale / 1000)

    return inst.sendTransaction({from: accounts[0], value: 20000}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaiser = 0
        assert.equal(raised.toNumber(), 0, "wei raised is incorrect")
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 0
          assert.equal(totalSupply.toNumber(), 0, "whitelist presale buy not correct")
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 0
          assert.equal(purchased.toNumber(), 0, "purchaser balance presale buy not correct")
        })
      })
    })
  })
  it("can't buy presale low value non-whitelist purchase", function() {
    presale = new Date().getTime()
    presale = Math.floor(presale / 1000)
    start = new Date().getTime() + 10000
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000
    end = Math.floor(end / 1000)

    return inst.setTime(presale, start, end).then(function() {
      return inst.sendTransaction({from: accounts[0], value: 20000}).then(function(res) {
        return inst.weiRaised.call().then(function(raised) {
          // assert weiRaiser = 0
          assert.equal(raised.toNumber(), 0, "can't presale buy not correct")
        })
      })
    })
  })
  it("halts payments in an emergency", function() {
    presale = new Date().getTime() - 10000000
    presale = Math.floor(presale / 1000)
    start = new Date().getTime() + 10000000
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000000
    end = Math.floor(end / 1000)

    return inst.setTime(presale, start, end).then(function() {
      return inst.halt({from: accounts[0]}).then(function(){
        return inst.sendTransaction({from: accounts[1], value: 20000}).then(function(res) {
          return inst.weiRaised.call()
        }).then(function(raised) {
          // assert wei raised is 0
          assert.equal(raised.toNumber(), 0, "halted wei presale purchase did not issue correct amount")
          return inst.unhalt({from: accounts[0]})
        }).then(function(res) {
          return inst.halted.call()
        }).then(function(halted) {
          // assert halted is false now
          assert.equal(halted, false, "could not unhalt crowdsale")
        })
      })
    })
  })
  it("can buy presale whitelist purchase", function() {
    presale = new Date().getTime() - 10000000
    presale = Math.floor(presale / 1000)
    start = new Date().getTime() + 10000000
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000000
    end = Math.floor(end / 1000)

    return inst.setTime(presale, start, end).then(function(){
      return inst.sendTransaction({from: accounts[1], value: 20000}).then(function(res) {
        return inst.weiRaised.call()
      }).then(function(raised){
        // assert weiRaised = 20000
        assert.equal(raised.toNumber(), 20000, "whitelist presale purchase did not issue correct amount")
        return token.totalSupply.call().then(function(totalSupply){
          tSupply = totalSupply
          // assert total supply = 20000 * 1397
          assert.equal(totalSupply.toNumber(), 20000*1397, "halted wei presale purchase did not issue correct amount")
          return token.balanceOf(accounts[1])
        }).then(function(purchased) {
          a1Balance = purchased
          // assert total = 20000 * 1397
          assert.equal(purchased.toNumber(), (20000*1397), "20000 wei presale purchase did not issue correct amount")
        })
      })
    })
  })
  it("can buy presale tier one purchase", function() {
    return inst.sendTransaction({from: accounts[0], value: 75*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 75 eth
        assert.equal(raised.toNumber(), 20000 + 75*Math.pow(10, 18), "tier one presale purchase did not issue correct amount")
        return token.totalSupply.call().then(function(totalSupply){
          tSupply = totalSupply
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          a0Balance = purchased
          // assert total = 75 eth * 1164 + 20000 wei * 1164
          var sum = a0Balance.plus(a1Balance)
          assert.equal(tSupply.toString(10), sum.toString(10), "75 eth purchase did not issue correct amount")
        })
      })
    })
  })
  it("can buy presale tier two purchase", function() {
    return inst.sendTransaction({from: accounts[0], value: 150*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 75 eth + 150 eth
        var n1 = new BigNumber(75*Math.pow(10, 18))
        var n2 = new BigNumber(150*Math.pow(10, 18))
        var n3 = new BigNumber(20000)
        var s = n1.plus(n2)
        var s = s.plus(n3)
        assert.equal(raised.toString(10), s.toString(10), "tier one presale purchase did not issue correct amount")
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 1397 + 75 eth * 1164 + 150 eth * 1281
          tSupply = totalSupply
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 75 eth * 1164 + 150 eth * 1281
          a0Balance = purchased
          var sum = a0Balance.plus(new BigNumber(20000*1397))
          assert.equal(tSupply.toString(10), sum.toString(10), "150 eth purchase did not issue correct amount")
        })
      })
    })
  })
  it("can buy presale tier three purchase", function() {
    return inst.sendTransaction({from: accounts[0], value: 300*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth
        var n1 = new BigNumber(75*Math.pow(10, 18))
        var n2 = new BigNumber(150*Math.pow(10, 18))
        var n3 = new BigNumber(300*Math.pow(10, 18))
        var n4 = new BigNumber(20000)
        var s = n1.plus(n2).plus(n3).plus(n4)
        assert.equal(raised.toString(10), s.toString(10), "tier one presale purchase did not issue correct amount")
        return token.totalSupply.call().then(function(totalSupply){
          tSupply = totalSupply
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 75 eth * 1164 + 150 eth * 1281 + 300 eth * 1339
          a0Balance = purchased
          var sum = a0Balance.plus(new BigNumber(20000*1397))
          assert.equal(tSupply.toString(10), sum.toString(10), "150 eth purchase did not issue correct amount")
        })
      })
    })
  })
  it("can't buy if presale cap is reached", function() {
    var events = inst.allEvents();
    return inst.sendTransaction({from: accounts[0], value: 803765*Math.pow(10, 17)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth
        var n1 = new BigNumber(75*Math.pow(10, 18))
        var n2 = new BigNumber(150*Math.pow(10, 18))
        var n3 = new BigNumber(300*Math.pow(10, 18))
        var n4 = new BigNumber(20000)
        var s = n1.plus(n2).plus(n3).plus(n4)
        assert.equal(raised.toString(10), s.toString(10), "presale cap reached purchase did not issue correct amount")
        return token.totalSupply.call().then(function(totalSupply){
          tSupply = totalSupply
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 75 eth * 1164 + 150 eth * 1281 + 300 eth * 1339
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164)+(150*1281)+(300*1339), "over cap eth purchase did not issue correct amount")
        })
      })
    })
  })
  it("can buy regular sale purchase", function() {
    presale = new Date().getTime() - 10000000
    presale = Math.floor(presale / 1000)
    start = new Date().getTime()
    start = Math.floor(start / 1000)
    end = new Date().getTime() + 20000000
    end = Math.floor(end / 1000)

    return inst.setTime(presale, start, end).then(function(){
      return inst.sendTransaction({from: accounts[0], value: 1*Math.pow(10, 18)}).then(function(res) {
        return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth + 1 eth
          var n1 = new BigNumber(75*Math.pow(10, 18))
          var n2 = new BigNumber(150*Math.pow(10, 18))
          var n3 = new BigNumber(300*Math.pow(10, 18))
          var n4 = new BigNumber(20000)
          var n5 = new BigNumber(1*Math.pow(10, 18))
          var s = n1.plus(n2).plus(n3).plus(n4).plus(n5)
          assert.equal(raised.toString(10), s.toString(10), "presale cap reached purchase did not issue correct amount")
          return token.totalSupply.call().then(function(totalSupply){
            tSupply = totalSupply
            return token.balanceOf(accounts[0])
          }).then(function(purchased) {
            // assert total = 50 eth * 2164 + 100 eth * 3164
            var amount = web3.fromWei(purchased.toNumber())
            assert.equal(amount, (75*1164)+(150*1281)+(300*1339)+1164, "1 eth purchase did not issue correct amount")
          })
        })
      })
    })
  })
  it("can't buy if sale cap is reached", function() {
    return inst.sendTransaction({from: accounts[0], value: 161277*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth + 1 eth
        var n1 = new BigNumber(75*Math.pow(10, 18))
        var n2 = new BigNumber(150*Math.pow(10, 18))
        var n3 = new BigNumber(300*Math.pow(10, 18))
        var n4 = new BigNumber(20000)
        var n5 = new BigNumber(1*Math.pow(10, 18))
        var s = n1.plus(n2).plus(n3).plus(n4).plus(n5)
        assert.equal(raised.toString(10), s.toString(10), "presale cap reached purchase did not issue correct amount") 
        return token.totalSupply.call().then(function(totalSupply){
          tSupply = totalSupply
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 50 eth * 2164 + 100 eth * 3164
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164)+(150*1281)+(300*1339)+1164, "over cap eth purchase did not issue correct amount")
        })
      })
    })
  })
  it("can't buy after sale end time", function() {
    end = new Date().getTime()
    end = Math.floor(end / 1000)

    return inst.setTime(presale, start, end).then(function() {
      return inst.sendTransaction({from: accounts[0], value: 20000}).then(function(res) {
        return inst.weiRaised.call().then(function(raised) {
          // assert weiRaised = 20000 + 75 eth + 150 eth + 300 eth + 1 eth
          var n1 = new BigNumber(75*Math.pow(10, 18))
          var n2 = new BigNumber(150*Math.pow(10, 18))
          var n3 = new BigNumber(300*Math.pow(10, 18))
          var n4 = new BigNumber(20000)
          var n5 = new BigNumber(1*Math.pow(10, 18))
          var s = n1.plus(n2).plus(n3).plus(n4).plus(n5)
          assert.equal(raised.toString(10), s.toString(10), "presale cap reached purchase did not issue correct amount")         
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164)+(150*1281)+(300*1339)+1164, "after time end did not issue correct amount")
        })
      })
    })
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
    })
  })

})
