var Crowdsale = artifacts.require("./Crowdsale.sol")
var Token = artifacts.require("./MatryxToken")

var inst
var token

contract('Sale', function(accounts) {
  // Token Tests
  // it("Crowdsale & Token deployed", function() {
  //   return Crowdsale.new(Crowdsale, 1503723092, 1503809492, "0x0040077926585455c40ceA126B37bED392aCa8C2").then(function(instance){
  //     inst = instance
  //     return instance.token()
  //   }).then(function(address){
  //     // assert address exists
  //     console.log(address)
  //     Token.at(address).then(function(instance) {
  //       token = instance;
  //       return token.totalSupply.call()
  //     }).then(function(total) {
  //       console.log(total.toNumber())
  //       // assert totalSupply init to 0
  //       return token.name.call().then(function(name){
  //         // assert vanity variable is set
  //         console.log(name)
  //       })
  //     })
  //   })
  // })

  // // CrowdSale Tests
  // it("updates the presale whitelist", function() {
  //   return Crowdsale.deployed().then(function(instance) {
  //     inst = instance 
  //     return instance.updateWhitelist("0x00c1b6f5d5939bd8c71b3c37ce830321c47dbcdb", {from: "0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303"})
  //   }).then(function(tx) {
  //     //console.log(ret)
  //     return inst.whitelist("0x00c1b6f5d5939bd8c71b3c37ce830321c47dbcdb")
  //   }).then(function(listed){
  //     assert.isTrue(listed)
  //   })
  // })
  // it("can't buy presale non-whitelist purchase", function() {
  //   return inst.sendTransaction({from: "0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303", value: 20000}).then(function(res) {
  //     //console.log(res)
  //     return inst.weiRaised.call().then(function(raised){
  //       // assert weiRaiser = 0
  //       console.log(raised.toNumber())
  //       // assert balance returned to purchaser
  //       console.log(web3.eth.getBalance(accounts[0]).toNumber())
  //       console.log(web3.eth.getBalance(accounts[1]).toNumber())
  //     })
  //   })
  // })
  // it("can buy presale whitelist purchase", function() {
  //   return inst.sendTransaction({from: "0x00c1b6f5d5939bd8c71b3c37ce830321c47dbcdb", value: 20000}).then(function(res) {
  //     return inst.weiRaised.call().then(function(raised){
  //       // assert weiRaised = 20000
  //       console.log(raised.toNumber())
  //       return token.totalSupply.call().then(function(totalSupply){
  //         // assert total supply = 20000 * 4164
  //         console.log(totalSupply.toNumber())
  //         return token.balanceOf("0x00c1b6f5d5939bd8c71b3c37ce830321c47dbcdb")
  //       }).then(function(purchased) {
  //         // assert total = 20000 * 4164
  //         console.log(purchased.toNumber())
  //       })
  //     })
  //   })
  // })
  // it("can buy presale tier one purchase", function() {
  //   return inst.sendTransaction({from: "0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303", value: 50000000000000000000}).then(function(res) {
  //     return inst.weiRaised.call().then(function(raised){
  //       // assert weiRaised = 20000 + 50 eth
  //       console.log(raised.toNumber())
  //       return token.totalSupply.call().then(function(totalSupply){
  //         // assert total supply = 20000 * 4164 + 50 eth * 2164
  //         console.log(web3.fromWei(totalSupply.toNumber()))
  //         return token.balanceOf("0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303")
  //       }).then(function(purchased) {
  //         // assert total = 50 eth * 2164
  //         var amount = web3.fromWei(purchased.toNumber())
  //         assert.equal(amount, (50*2164), "50 eth purchase did not issue correct amount")
  //         console.log(web3.fromWei(purchased.toNumber()))
  //       })
  //     })
  //   })
  // })
  // it("can buy presale tier two purchase", function() {
  //   return inst.sendTransaction({from: "0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303", value: 100000000000000000000}).then(function(res) {
  //     return inst.weiRaised.call().then(function(raised){
  //       // assert weiRaised = 20000 + 50 eth + 100 eth
  //       console.log(raised.toNumber())
  //       return token.totalSupply.call().then(function(totalSupply){
  //         // assert total supply = 20000 * 4164 + 50 eth * 2164 + 100 eth * 3164
  //         console.log(web3.fromWei(totalSupply.toNumber()))
  //         return token.balanceOf("0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303")
  //       }).then(function(purchased) {
  //         // assert total = 50 eth * 2164 + 100 eth * 3164
  //         var amount = web3.fromWei(purchased.toNumber())
  //         assert.equal(amount, (50*2164)+(100*3164), "100 eth purchase did not issue correct amount")
  //         console.log(web3.fromWei(purchased.toNumber()))
  //       })
  //     })
  //   })
  // })

})

