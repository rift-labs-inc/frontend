// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.19;

// Derive from the Wrapped Bitcoin contract
interface ERC20Basic {
  function totalSupply() external view returns (uint256);
  function balanceOf(address _who) external view returns (uint256);
  function transfer(address _to, uint256 _value) external returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

interface ERC20 is ERC20Basic {
  function allowance(address _owner, address _spender)
    external view returns (uint256);

  function transferFrom(address _from, address _to, uint256 _value)
    external returns (bool);

  function approve(address _spender, uint256 _value) external returns (bool);
  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}
