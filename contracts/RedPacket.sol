// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RedPacket {
    using SafeERC20 for IERC20;

    struct Packet {
        address creator;
        address token;
        uint256 totalAmount;
        uint256 totalCount;
        uint256 claimedCount;
        uint256 createdAt;
        bool active;
        mapping(address => bool) claimed;
    }

    mapping(bytes32 => Packet) private packets;
    mapping(bytes32 => uint256[]) private amounts;

    event RedPacketCreated(
        bytes32 indexed packetId,
        address indexed creator,
        address indexed token,
        uint256 totalAmount,
        uint256 totalCount
    );
    event RedPacketClaimed(bytes32 indexed packetId, address indexed claimer, uint256 amount);
    event RedPacketExpired(bytes32 indexed packetId);

    uint256 public constant EXPIRE_TIME = 7 days;
    address private constant NATIVE_TOKEN = address(0);

    function createRedPacket(
        bytes32 packetId,
        uint256 totalCount,
        uint256[] calldata amounts_,
        address token
    ) external payable {
        require(totalCount > 0, "Count must be greater than 0");
        require(amounts_.length == totalCount, "Invalid amounts");

        Packet storage packet = packets[packetId];
        require(packet.creator == address(0) || !packet.active, "Packet exists");

        uint256 totalAmount = _sumArray(amounts_);
        require(totalAmount > 0, "Amount must be greater than 0");

        packet.creator = msg.sender;
        packet.token = token;
        packet.totalAmount = totalAmount;
        packet.totalCount = totalCount;
        packet.claimedCount = 0;
        packet.createdAt = block.timestamp;
        packet.active = true;

        _storeAmounts(packetId, amounts_);

        if (token == NATIVE_TOKEN) {
            require(msg.value == totalAmount, "Total amount mismatch");
        } else {
            require(msg.value == 0, "Do not send ETH for tokens");
            IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        }

        emit RedPacketCreated(packetId, msg.sender, token, totalAmount, totalCount);
    }

    function claimRedPacket(bytes32 packetId, uint256 index) external {
        Packet storage packet = packets[packetId];

        require(packet.active, "Packet is not active");
        require(!packet.claimed[msg.sender], "Already claimed");
        require(packet.claimedCount < packet.totalCount, "All packets claimed");
        require(index < amounts[packetId].length, "Invalid index");

        if (block.timestamp > packet.createdAt + EXPIRE_TIME) {
            packet.active = false;
            emit RedPacketExpired(packetId);
            revert("Red packet expired");
        }

        uint256 amount = amounts[packetId][index];
        require(amount > 0, "No amount available");

        packet.claimed[msg.sender] = true;
        packet.claimedCount++;
        amounts[packetId][index] = 0;

        if (packet.token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(packet.token).safeTransfer(msg.sender, amount);
        }

        emit RedPacketClaimed(packetId, msg.sender, amount);
    }

    function hasClaimed(bytes32 packetId, address user) external view returns (bool) {
        return packets[packetId].claimed[user];
    }

    function getPacketInfo(bytes32 packetId)
        external
        view
        returns (
            address creator,
            uint256 totalAmount,
            uint256 totalCount,
            uint256 claimedCount,
            bool active,
            address token
        )
    {
        Packet storage packet = packets[packetId];
        return (
            packet.creator,
            packet.totalAmount,
            packet.totalCount,
            packet.claimedCount,
            packet.active,
            packet.token
        );
    }

    function getPacketAmounts(bytes32 packetId) external view returns (uint256[] memory) {
        return amounts[packetId];
    }

    function refundExpiredPacket(bytes32 packetId) external {
        Packet storage packet = packets[packetId];

        require(packet.creator == msg.sender, "Only creator can refund");
        require(block.timestamp > packet.createdAt + EXPIRE_TIME, "Packet not expired yet");
        require(packet.active, "Packet already refunded");

        uint256 refundAmount = 0;
        uint256[] storage packetAmounts = amounts[packetId];
        for (uint256 i = 0; i < packetAmounts.length; i++) {
            refundAmount += packetAmounts[i];
            packetAmounts[i] = 0;
        }

        packet.active = false;

        if (packet.token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{value: refundAmount}("");
            require(success, "Refund failed");
        } else {
            IERC20(packet.token).safeTransfer(msg.sender, refundAmount);
        }
    }

    receive() external payable {}

    function _storeAmounts(bytes32 packetId, uint256[] calldata amounts_) internal {
        delete amounts[packetId];
        uint256[] storage packetAmounts = amounts[packetId];
        for (uint256 i = 0; i < amounts_.length; i++) {
            packetAmounts.push(amounts_[i]);
        }
    }

    function _sumArray(uint256[] calldata values) internal pure returns (uint256 total) {
        for (uint256 i = 0; i < values.length; i++) {
            total += values[i];
        }
    }
}
