export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'packetId', type: 'bytes32' },
      { internalType: 'uint256', name: 'totalCount', type: 'uint256' },
      { internalType: 'uint256[]', name: 'amounts_', type: 'uint256[]' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'createRedPacket',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'packetId', type: 'bytes32' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'claimRedPacket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'packetId', type: 'bytes32' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'hasClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'packetId', type: 'bytes32' }],
    name: 'getPacketInfo',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'totalCount', type: 'uint256' },
      { internalType: 'uint256', name: 'claimedCount', type: 'uint256' },
      { internalType: 'bool', name: 'active', type: 'bool' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'packetId', type: 'bytes32' }],
    name: 'getPacketAmounts',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'packetId', type: 'bytes32' }],
    name: 'refundExpiredPacket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const NETWORKS = {
  localhost: {
    name: 'Local Hardhat',
    chainId: '0x539',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorerUrl: 'http://localhost:3000',
  },
  bsc_testnet: {
    name: 'BSC Testnet',
    chainId: '0x61',
    rpcUrl: 'https://data-seed-prebsc-1-b.binance.org:8545',
    blockExplorerUrl: 'https://testnet.bscscan.com',
  },
} as const;
