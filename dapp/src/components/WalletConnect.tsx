import '../styles/WalletConnect.css';
import { formatAddress } from '../utils/web3';

type WalletConnectProps = {
  account: string | null;
  onConnect: () => void | Promise<void>;
};

export const WalletConnect = ({ account, onConnect }: WalletConnectProps) => {
  return (
    <div className="wallet-connect">
      {account ? (
        <button className="wallet-btn connected" type="button">
          {formatAddress(account)}
        </button>
      ) : (
        <button className="wallet-btn" type="button" onClick={onConnect}>
          连接钱包
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
