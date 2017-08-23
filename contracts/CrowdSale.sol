pragma solidity ^0.4.11;

import './MatryxToken.sol';
import './MintableToken.sol';
import './math/SafeMath.sol';
import './Haltable.sol';
import './ownership/Ownable.sol';

/**
 * @title Crowdsale 
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet 
 * as they arrive.
 *
 * This crowdsale contract is also based on the TokenMarket Crowdsale
 */
contract Crowdsale is Ownable, Haltable {
  using SafeMath for uint256;

  // The token being sold
  //MatryxToken public token = MatryxToken(0x392985aEF88D4Ef849A6Ec230706B71609403F59);
  MatryxToken public token;
  //MintableToken public token;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  // address where funds are collected
  //address public wallet = 0x0;
  address public wallet;

  // how many token units a buyer gets per wei
  uint256 public rate = 1164;

  // how many token units a buyer gets per wei with tier 1 discount
  uint256 public lowDiscountRate = 2164;

  // how many token units a buyer gets per wei with tier 2 discount
  uint256 public highDiscountRate = 3164;

  // how many token units a buyer gets per wei with tier 3 discount
  uint256 public whitelistRate = 4164;

  // amount of raised money in wei
  uint256 public weiRaised;

  // Total amount to be sold
  uint256 public cap = 188338692 * 10**18;

  // Total amount to be sold in the presale
  uint256 public presaleCap = 94169346 * 10**18;

  // Has this crowdsale been finalized
  bool public finalized;

  // Do we need to have unique contributor id for each customer
  bool public requireCustomerId;

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

  function Crowdsale(uint256 _startTime, uint256 _endTime, address _wallet) {
    //require(_token != 0x0);
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_wallet != 0x0);

    token = createTokenContract();
    //token = MatryxToken(_token);
    wallet = _wallet;
    startTime = _startTime;
    endTime = _endTime;
  }

  //creates the token to be sold. 
  //override this method to have crowdsale of a specific mintable token.
  function createTokenContract(address _token) internal returns (MatryxToken) {
  //function createTokenContract() internal returns (MintableToken) {
    //return MatryxToken(_token);
    //return new MintableToken();
    return new MatryxToken();
  }

  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) payable {
    require(beneficiary != 0x0);
    require(msg.value != 0);

    if(now < startTime) {
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
    // test this!!!! what if in the whitelist and sent over 100 ether? if else makes this okay?
    } else if(weiAmount < 100 * 10**18) {
      // Not whitelisted so they must have sent over 50 ether 
      tokens = weiAmount.mul(lowDiscountRate);
    } else {
      // Over 100 ether was sent
      tokens = weiAmount.mul(highDiscountRate);
    }

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);

    // update the early list so they may purchase smaller amounts
    //earlyParticipantList[msg.sender] = true;

    // Update investor
    investedAmountOf[msg.sender] = investedAmountOf[msg.sender].add(msg.value);
    tokenAmountOf[msg.sender] = tokenAmountOf[msg.sender].add(tokens);

    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  function buySale(address beneficiary) internal {
    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);

    // update the early list so they may purchase smaller amounts
    //earlyParticipantList[msg.sender] = true;

    // Update investor
    investedAmountOf[msg.sender] = investedAmountOf[msg.sender].add(msg.value);
    tokenAmountOf[msg.sender] = tokenAmountOf[msg.sender].add(tokens);

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
    // TODO write finalization logic
    
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  // Allow the owner to update the presale whitelist
  function updateWhitelist(address _purchaser) onlyOwner {
    whitelist[_purchaser] = true;
  }

  // @return true if the presale transaction can buy tokens
  function validPrePurchase() internal constant returns (bool) {
    bool canPrePurchase = 50 * 10**18 <= msg.value || whitelist[msg.sender];
    bool withinCap = weiRaised.add(msg.value) <= presaleCap;
    return canPrePurchase && withinCap;
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    bool withinPeriod = now <= endTime;
    bool withinCap = weiRaised.add(msg.value) <= cap;
    return withinPeriod && withinCap;
  }

  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    bool capReached = weiRaised >= cap;
    return now > endTime || capReached;
  }


}