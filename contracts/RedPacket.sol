// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RedPacket {
    struct Packet {
        address creator;
        uint256 totalAmount;
        uint256 totalCount;
        uint256 claimedCount;
        uint256 createdAt;
        bool active;
        mapping(address => bool) claimed;
    }

    mapping(bytes32 => Packet) public packets;
    mapping(bytes32 => uint256[]) public amounts;

    event RedPacketCreated(bytes32 indexed packetId, address indexed creator, uint256 totalAmount, uint256 totalCount);
    event RedPacketClaimed(bytes32 indexed packetId, address indexed claimer, uint256 amount);
    event RedPacketExpired(bytes32 indexed packetId);

    uint256 public constant EXPIRE_TIME = 7 days;

    // 创建红包
    function createRedPacket(
        bytes32 packetId,
        uint256 totalCount,
        uint256[] calldata amounts_
    ) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(totalCount > 0, "Count must be greater than 0");
        require(amounts_.length == totalCount, "Invalid amounts");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts_.length; i++) {
            totalAmount += amounts_[i];
        }
        require(msg.value == totalAmount, "Total amount mismatch");

        packets[packetId].creator = msg.sender;
        packets[packetId].totalAmount = msg.value;
        packets[packetId].totalCount = totalCount;
        packets[packetId].claimedCount = 0;
        packets[packetId].createdAt = block.timestamp;
        packets[packetId].active = true;

        amounts[packetId] = amounts_;

        emit RedPacketCreated(packetId, msg.sender, msg.value, totalCount);
    }

    // 领取红包
    function claimRedPacket(bytes32 packetId, uint256 index) external {
        Packet storage packet = packets[packetId];

        require(packet.active, "Packet is not active");
        require(!packet.claimed[msg.sender], "Already claimed");
        require(packet.claimedCount < packet.totalCount, "All packets claimed");
        require(index < amounts[packetId].length, "Invalid index");

        // 检查红包是否过期（7天）
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

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit RedPacketClaimed(packetId, msg.sender, amount);
    }

    // 查询是否已领取
    function hasClaimed(bytes32 packetId, address user) external view returns (bool) {
        return packets[packetId].claimed[user];
    }

    // 查询红包信息
    function getPacketInfo(bytes32 packetId)
        external
        view
        returns (
            address creator,
            uint256 totalAmount,
            uint256 totalCount,
            uint256 claimedCount,
            bool active
        )
    {
        Packet storage packet = packets[packetId];
        return (packet.creator, packet.totalAmount, packet.totalCount, packet.claimedCount, packet.active);
    }

    // 查询红包金额列表
    function getPacketAmounts(bytes32 packetId) external view returns (uint256[] memory) {
        return amounts[packetId];
    }

    // 红包过期后，创建者可以退款
    function refundExpiredPacket(bytes32 packetId) external {
        Packet storage packet = packets[packetId];
        
        require(packet.creator == msg.sender, "Only creator can refund");
        require(block.timestamp > packet.createdAt + EXPIRE_TIME, "Packet not expired yet");
        require(packet.active, "Packet already refunded");

        uint256 refundAmount = packet.totalAmount;
        for (uint256 i = 0; i < amounts[packetId].length; i++) {
            refundAmount -= amounts[packetId][i];
        }

        packet.active = false;

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");
    }

    // 接收ETH
    receive() external payable {}
}
