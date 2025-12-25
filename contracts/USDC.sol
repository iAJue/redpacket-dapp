// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title USDC mock token (OpenZeppelin-based)
/// @dev Deploy with initialSupply expressed in whole tokens (will be scaled by decimals)
contract USDC is ERC20 {
    uint8 private constant CUSTOM_DECIMALS = 6;

    constructor(uint256 initialSupply) ERC20("USDC Token", "USDC") {
        _mint(msg.sender, initialSupply * 10 ** CUSTOM_DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return CUSTOM_DECIMALS;
    }
}
