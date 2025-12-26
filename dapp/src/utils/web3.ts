import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../config/contract';
import contractAddresses from '../config/contractAddresses.json';
import type { AssetOption } from '../config/assets';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const FALLBACK_RPC = 'http://127.0.0.1:8545';
const rpcUrl = import.meta.env.VITE_RPC_URL ?? FALLBACK_RPC;
const configuredContractAddress =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined)?.trim() ||
  contractAddresses.redPacket;
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function balanceOf(address owner) public view returns (uint256)',
  'function decimals() public view returns (uint8)',
];

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const getContract = (signerOrProvider?: ethers.Provider | ethers.Signer) => {
  const finalProvider = signerOrProvider ?? getProvider();
  return new ethers.Contract(configuredContractAddress, CONTRACT_ABI, finalProvider);
};

export const getTokenContract = (tokenAddress: string, signerOrProvider?: ethers.Provider | ethers.Signer) => {
  const finalProvider = signerOrProvider ?? getProvider();
  return new ethers.Contract(tokenAddress, ERC20_ABI, finalProvider);
};

export const connectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('请先安装 Web3 钱包');
  }

  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  if (!accounts?.length) {
    throw new Error('未能获取到钱包地址');
  }

  return accounts[0];
};

export const getAccount = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  const accounts = (await window.ethereum.request({
    method: 'eth_accounts',
  })) as string[];

  return accounts?.[0] ?? null;
};

export const generatePacketId = () => ethers.id(`${Date.now()}-${Math.random()}`);

export const formatAddress = (address?: string | null) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const parseWei = (wei: bigint | string, decimals = 18) => {
  return ethers.formatUnits(wei, decimals);
};

export const toWei = (amount: string | number, decimals = 18) => {
  return ethers.parseUnits(amount.toString(), decimals);
};
