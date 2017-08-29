pragma solidity ^0.4.11;

import "./MintableToken.sol";


/**
 * Matryx Ethereum token.
 */
contract MatryxToken is MintableToken {

  string public name = "MatryxToken";
  string public symbol = "MTX";
  uint public decimals = 18;
}