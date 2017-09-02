pragma solidity ^0.4.11;

import '../MatryxToken.sol';
import '../math/SafeMath.sol';
import '../Haltable.sol';
import '../ownership/Ownable.sol';

/**
 * @title TestCrowdsale
 * This is for manual testing of unix epochs
 */
contract TestCrowdsale is Ownable, Haltable {
  using SafeMath for uint256;

  // The token being sold
  MatryxToken public token;

  // presale, start and end timestamps where investments are allowed
  uint256 public presaleStartTime;
  uint256 public startTime;
  uint256 public endTime;
  uint256 public _now;

  /* How many distinct addresses have invested */
  uint public investorCount = 0;

  // address where funds are collected
  //address public wallet = 0x0;
  address public wallet;

  // how many token units a buyer gets per ether
  uint256 public baseRate = 1164;

  // how many token units a buyer gets per ether with tier 2 10% discount
  uint256 public tierTwoRate = 1281;

  // how many token units a buyer gets per ether with tier 3 15% discount
  uint256 public tierThreeRate = 1339;

  // how many token units a buyer gets per ether with a whitelisted 20% discount
  uint256 public whitelistRate = 1397;

  // the minimimum presale purchase amount in ether
  uint256 public tierOnePurchase = 75 * 10**18;

  // the second tier discount presale purchase amount in ether
  uint256 public tierTwoPurchase = 150 * 10**18;

  // the second tier discount presale purchase amount in ether
  uint256 public tierThreePurchase = 300 * 10**18;

  // amount of raised money in wei
  uint256 public weiRaised;

  // Total amount to be sold in ether
  uint256 public cap = 161803 * 10**18;

  // Total amount to be sold in the presale in ether
  uint256 public presaleCap = 809015 * 10**17;

  // Is the contract finalized
  bool public isFinalized = false;

  // How much ETH each address has invested to this crowdsale
  mapping (address => uint256) public investedAmountOf;

  // How much tokens this crowdsale has credited for each investor address
  mapping (address => uint256) public tokenAmountOf;

  // Addresses that have purchased tokens in the presale.
  //mapping (address => bool) public earlyParticipantList;

  // Addresses of whitelisted presale investors.
  mapping (address => bool) public whitelist;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */ 
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  // Address early participation whitelist status changed
  event Whitelisted(address addr, bool status);

  // Crowdsale end time has been changed
  event EndsAtChanged(uint newEndsAt);

  event Finalized();

  function TestCrowdsale() {
    // test constructor args manually
    uint256 _presaleStartTime = 1506399909;
    uint256 _startTime = 1508991909;
    uint256 _endTime = 1511673909;
    address _wallet = 0x01da6F5F5C89F3a83CC6BeBb0eAFC1f1E1c4A303;

    require(_startTime >= now);
    require(_presaleStartTime >= now && _presaleStartTime < _startTime);
    require(_endTime >= _startTime);
    require(_wallet != 0x0);

    token = createTokenContract();
    wallet = _wallet;
    presaleStartTime = _presaleStartTime;
    startTime = _startTime;
    endTime = _endTime;
  }
  
  // test helper to set times
  function setTime(uint256 _presaleStartTime, uint256 _startTime, uint256 _endTime) {
    _now = now;
    presaleStartTime = _presaleStartTime;
    startTime = _startTime;
    endTime = _endTime;
  }
  //creates the token to be sold. 
  //override this method to have crowdsale of a specific mintable token.
  function createTokenContract() internal returns (MatryxToken) {
    return new MatryxToken();
  }

  // fallback function throws
  function () payable {
    throw;
  }

  function buy() public payable {
    buyTokens(msg.sender);
  }
  
  // low level token purchase function
  function buyTokens(address beneficiary) stopInEmergency payable {
    require(beneficiary != 0x0);
    require(msg.value != 0);
    
    if(isPresale()) {
      require(validPrePurchase());
      buyPresale(beneficiary);
    } else {
      require(validPurchase());
      buySale(beneficiary);
    }
  }

  function buyPresale(address beneficiary) internal {
    uint256 weiAmount = msg.value;
    uint256 tokens = 0;
    
    // calculate discount
    if(whitelist[msg.sender]) {
      tokens = weiAmount.mul(whitelistRate);
    } else if(weiAmount < tierTwoPurchase) {
      // Not whitelisted so they must have sent over 75 ether 
      tokens = weiAmount.mul(baseRate);
    } else if(weiAmount < tierThreePurchase) {
      // Over 150 ether was sent
      tokens = weiAmount.mul(tierTwoRate);
    } else {
      // Over 300 ether was sent
      tokens = weiAmount.mul(tierThreeRate);
    }

    // update state
    weiRaised = weiRaised.add(weiAmount);

    // Update investor
    investedAmountOf[msg.sender] = investedAmountOf[msg.sender].add(msg.value);
    tokenAmountOf[msg.sender] = tokenAmountOf[msg.sender].add(tokens);
    investorCount++;

    token.mint(beneficiary, tokens);

    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  function buySale(address beneficiary) internal {
    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(baseRate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);

    // Update investor
    investedAmountOf[msg.sender] = investedAmountOf[msg.sender].add(msg.value);
    tokenAmountOf[msg.sender] = tokenAmountOf[msg.sender].add(tokens);
    investorCount++;

    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  /**
   * @dev Must be called after crowdsale ends, to do some extra finalization
   * work. Calls the contract's finalization function.
   */
  function finalize() onlyOwner {
    require(!isFinalized);
    require(hasEnded());

    finalization();
    Finalized();
    
    isFinalized = true;
  }

  /**
   * @dev Can be overriden to add finalization logic. The overriding function
   * should call super.finalization() to ensure the chain of finalization is
   * executed entirely.
   */
  function finalization() internal {
    // calculate token amount to be created
    // expected tokens sold
    uint256 piTokens = 314159265*10**18;
    // get the difference of sold and expected
    uint256 tokens = piTokens.sub(token.totalSupply());
    // issue tokens to the multisig wallet
    token.mint(wallet, tokens);
    token.finishMinting();
    token.transferOwnership(msg.sender);
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  // Allow the owner to update the presale whitelist
  function updateWhitelist(address _purchaser) onlyOwner {
    whitelist[_purchaser] = true;
    Whitelisted(_purchaser, true);
  }

  /**
   * Allow crowdsale owner to close early or extend the crowdsale.
   *
   * This is useful e.g. for a manual soft cap implementation:
   * - after X amount is reached determine manual closing
   *
   * This may put the crowdsale to an invalid state,
   * but we trust owners know what they are doing.
   *
   */
  function setEndsAt(uint time) onlyOwner {
    require(now < time);

    endTime = time;
    EndsAtChanged(endTime);
  }


  // @return true if the presale transaction can buy tokens
  function validPrePurchase() internal constant returns (bool) {
    // this asserts that the value is at least the lowest tier 
    // or the address has been whitelisted to purchase with less
    bool canPrePurchase = tierOnePurchase <= msg.value || whitelist[msg.sender];
    bool withinCap = weiRaised.add(msg.value) <= presaleCap;
    return canPrePurchase && withinCap;
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    bool withinPeriod = now >= presaleStartTime && now <= endTime;
    bool withinCap = weiRaised.add(msg.value) <= cap;
    return withinPeriod && withinCap;
  }

  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    bool capReached = weiRaised >= cap;
    return now > endTime || capReached;
  }

  // @return true if within presale time
  function isPresale() public constant returns (bool) {
    bool withinPresale = now >= presaleStartTime && now < startTime;
    return withinPresale;
  }

}