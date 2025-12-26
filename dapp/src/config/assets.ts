import addresses from './contractAddresses.json';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export type AssetOption = {
  label: string;
  symbol: string;
  address: string;
  decimals: number;
  isNative: boolean;
};

export const ASSETS: AssetOption[] = [
  {
    label: '以太坊',
    symbol: 'ETH',
    address: ZERO_ADDRESS,
    decimals: 18,
    isNative: true,
  },
  {
    label: 'USDC',
    symbol: 'USDC',
    address: addresses.usdc,
    decimals: 6,
    isNative: false,
  },
];

export const getAssetByAddress = (addr: string) =>
  ASSETS.find((asset) => asset.address.toLowerCase() === addr.toLowerCase());
