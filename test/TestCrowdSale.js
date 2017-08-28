//var Crowdsale = artifacts.require("./Crowdsale.sol")
var Crowdsale = artifacts.require("./TestCrowdsale.sol")
var Token = artifacts.require("./MatryxToken")

var inst
var token
var presale
var start
var end

contract('Presale', function(accounts) {
  // Token Tests
  it("Crowdsale & Token deployed", function() {
    return Crowdsale.deployed().then(function(instance){
      inst = instance
      return instance.token()
    }).then(function(address){
      // assert address exists
      console.log(address)
      Token.at(address).then(function(instance) {
        token = instance;
        return token.totalSupply.call()
      }).then(function(total) {
        console.log(total.toNumber())
        // assert totalSupply init to 0
        return token.name.call().then(function(name){
          // assert vanity variable is set
          console.log(name)
        })
      })
    })
  })
  it("sets the timestamps", function(){
    presale = new Date().getTime() + 1
    start = new Date().getTime() + 2
    end = new Date().getTime() + 3

    return inst.setTime(presale, start, end).then(function(){
      console.log("timestamps")
      console.log(presale)
      return inst.presaleStartTime.call()
    }).then(function(time) {
      // assert presale 
      console.log(time.toNumber())
    })
  })
  // CrowdSale Tests
  it("updates the presale whitelist", function() {
    return Crowdsale.deployed().then(function(instance) {
      inst = instance	
      return instance.updateWhitelist(accounts[1], {from: accounts[0]})
    }).then(function(tx) {
      //console.log(ret)
      return inst.whitelist(accounts[1])
    }).then(function(listed){
      console.log("whitelist updated")
      assert.isTrue(listed)
    })
  })
  it("can't buy before presale time", function() {
    presale = new Date().getTime() + 10000
    presale = Math.floor(presale / 1000)

    return inst.sendTransaction({from: accounts[0], value: 20000}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaiser = 0
        console.log(raised.toNumber())
        // assert balance returned to purchaser
        //console.log(web3.eth.getBalance(accounts[0]).toNumber())
        //console.log(web3.eth.getBalance(accounts[1]).toNumber())
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 4164
          console.log("-totalSupply-")
          console.log(totalSupply.toNumber())
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 20000 * 4164
          console.log("-tokens purchased")
          console.log(purchased.toNumber())
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
          console.log('wei raised low value non-whitelist purchase')
          console.log(raised.toNumber())
          // assert balance returned to purchaser
          // console.log(web3.eth.getBalance(accounts[0]).toNumber())
          // console.log(web3.eth.getBalance(accounts[1]).toNumber())
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
          console.log('halted wei raised')
          console.log(raised.toNumber())
          return inst.unhalt({from: accounts[0]})
        }).then(function(res) {
          return inst.halted.call()
        }).then(function(halted) {
          // assert halted is false now
          console.log("is halted?")
          console.log(halted)
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
        console.log('presale whitelist wei raised')
        console.log(web3.fromWei(raised.toNumber()))
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 4164
          console.log('presale whitelist total supply')
          console.log(totalSupply.toNumber())
          return token.balanceOf(accounts[1])
        }).then(function(purchased) {
          // assert total = 20000 * 4164
          console.log('presale whitelist token balance')
          console.log(purchased.toNumber())
          assert.equal(purchased.toNumber(), (20000*1397), "2000 wei presale purchase did not issue correct amount")
        })
      })
    })
  })
  it("can buy presale tier one purchase", function() {
    return inst.sendTransaction({from: accounts[0], value: 75*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 50 eth
        console.log(web3.fromWei(raised.toNumber()))
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 4164 + 50 eth * 2164
          console.log(web3.fromWei(totalSupply.toNumber()))
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 50 eth * 2164
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164), "50 eth purchase did not issue correct amount")
          console.log(web3.fromWei(purchased.toNumber()))
        })
      })
    })
  })
  it("can buy presale tier two purchase", function() {
    return inst.sendTransaction({from: accounts[0], value: 150*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 50 eth + 100 eth
        console.log(web3.fromWei(raised.toNumber()))
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 4164 + 50 eth * 2164 + 100 eth * 3164
          console.log(web3.fromWei(totalSupply.toNumber()))
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 50 eth * 2164 + 100 eth * 3164
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164)+(150*1281), "100 eth purchase did not issue correct amount")
          console.log(web3.fromWei(purchased.toNumber()))
        })
      })
    })
  })
  it("can buy presale tier three purchase", function() {
    return inst.sendTransaction({from: accounts[0], value: 300*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 50 eth + 100 eth
        console.log(web3.fromWei(raised.toNumber()))
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 4164 + 50 eth * 2164 + 100 eth * 3164
          console.log(web3.fromWei(totalSupply.toNumber()))
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 50 eth * 2164 + 100 eth * 3164
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164)+(150*1281)+(300*1339), "100 eth purchase did not issue correct amount")
          console.log(web3.fromWei(purchased.toNumber()))
        })
      })
    })
  })
  it("can't buy if presale cap is reached", function() {
    return inst.sendTransaction({from: accounts[0], value: 803765*Math.pow(10, 17)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 50 eth + 100 eth
        console.log(web3.fromWei(raised.toNumber()))
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 4164 + 50 eth * 2164 + 100 eth * 3164
          console.log(web3.fromWei(totalSupply.toNumber()))
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 50 eth * 2164 + 100 eth * 3164
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164)+(150*1281)+(300*1339), "over cap eth purchase did not issue correct amount")
          console.log(web3.fromWei(purchased.toNumber()))
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
          // assert weiRaised = 20000 + 50 eth + 100 eth
          console.log(raised.toNumber())
          return token.totalSupply.call().then(function(totalSupply){
            // assert total supply = 20000 * 4164 + 50 eth * 2164 + 100 eth * 3164
            console.log(web3.fromWei(totalSupply.toNumber()))
            return token.balanceOf(accounts[0])
          }).then(function(purchased) {
            // assert total = 50 eth * 2164 + 100 eth * 3164
            var amount = web3.fromWei(purchased.toNumber())
            assert.equal(amount, (75*1164)+(150*1281)+(300*1339)+1164, "1 eth purchase did not issue correct amount")
            console.log(web3.fromWei(purchased.toNumber()))
          })
        })
      })
    })
  })
  it("can't buy if sale cap is reached", function() {
    return inst.sendTransaction({from: accounts[0], value: 161277*Math.pow(10, 18)}).then(function(res) {
      return inst.weiRaised.call().then(function(raised){
        // assert weiRaised = 20000 + 50 eth + 100 eth
        console.log(web3.fromWei(raised.toNumber()))
        return token.totalSupply.call().then(function(totalSupply){
          // assert total supply = 20000 * 4164 + 50 eth * 2164 + 100 eth * 3164
          console.log(web3.fromWei(totalSupply.toNumber()))
          return token.balanceOf(accounts[0])
        }).then(function(purchased) {
          // assert total = 50 eth * 2164 + 100 eth * 3164
          var amount = web3.fromWei(purchased.toNumber())
          assert.equal(amount, (75*1164)+(150*1281)+(300*1339)+1164, "over cap eth purchase did not issue correct amount")
          console.log(web3.fromWei(purchased.toNumber()))
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
          // assert weiRaiser = 0
          console.log('wei raised low value non-whitelist purchase')
          console.log(raised.toNumber())
          // assert balance returned to purchaser
          // console.log(web3.eth.getBalance(accounts[0]).toNumber())
          // console.log(web3.eth.getBalance(accounts[1]).toNumber())
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
      console.log("final supply")
      console.log(web3.fromWei(total.toNumber()))
      assert.equal(web3.fromWei(total.toNumber()), 314159265, "Finalize did not issue correct tokens")
    })
  })

})
