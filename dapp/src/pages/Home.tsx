import type { CSSProperties } from 'react';
import '../styles/Home.css';
import { CreatePacket } from '../components/CreatePacket';

type HomeProps = {
  account: string | null;
  onConnect: () => void | Promise<void>;
  connectError?: string | null;
};

export const Home = ({ account, onConnect, connectError }: HomeProps) => {
  if (!account) {
    return (
      <div className="home-hero">
        <div className="bg-effect">
          {[...Array(6)].map((_, index) => (
            <div
              key={`coin-${index}`}
              className="decoration-item coin"
              style={{ '--delay': `${index * 0.5}s` } as CSSProperties}
            />
          ))}
          {[...Array(4)].map((_, index) => (
            <div
              key={`packet-${index}`}
              className="decoration-item packet"
              style={{ '--delay': `${index * 1}s` } as CSSProperties}
            />
          ))}
        </div>

        <div className="form-container">
          <div className="form-header">
            <h1>🎁 欢迎体验链上红包</h1>
            <p>连接钱包即可在链上随机拆分金额，再也不怕中心化风控</p>
          </div>

          <div className="no-wallet-box">
            <div className="wallet-icon">🧧</div>
            <h2>尚未连接钱包</h2>
            <p className="hint">连接后即可创建红包或使用领取链接</p>
            <button type="button" className="btn-open btn-connect" onClick={onConnect}>
              🔗 连接钱包
            </button>
            {connectError && <p className="hint error">{connectError}</p>}
          </div>
        </div>
      </div>
    );
  }

  return <CreatePacket account={account} />;
};

export default Home;
