pragma solidity ^0.4.11;

import "./MintableToken.sol";


/**
 * Matryx Ethereum token.
 */
contract MatryxToken is MintableToken {

  string public name = "MatryxToken";
  string public symbol = "MTX";
  uint public decimals = 18;
  address public foundation = 0x0;

  // function MatryxToken(address _foundation, string _name, string _symbol, uint _decimals) {
  //   name = _name;
  //   symbol = _symbol;
  //   decimals = _decimals;
  //   foundation = _foundation;
  // }
}