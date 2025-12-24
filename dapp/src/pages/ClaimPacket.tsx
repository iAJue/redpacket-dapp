import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ClaimPacket.css';
import { getContract, getProvider, parseWei } from '../utils/web3';

type ClaimPacketProps = {
  account: string | null;
  onConnect: () => void | Promise<void>;
};

type PacketInfo = {
  creator: string;
  totalAmount: number;
  totalCount: number;
  claimedCount: number;
  active: boolean;
};

export const ClaimPacket = ({ account, onConnect }: ClaimPacketProps) => {
  const { packetId } = useParams<{ packetId: string }>();
  const [packetInfo, setPacketInfo] = useState<PacketInfo | null>(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPacketInfo = useCallback(async () => {
    if (!packetId) return;
    setIsLoading(true);
    try {
      const provider = getProvider();
      const contract = getContract(provider);
      const info = await contract.getPacketInfo(packetId);

      const nextInfo: PacketInfo = {
        creator: info.creator,
        totalAmount: Number(parseWei(info.totalAmount)),
        totalCount: Number(info.totalCount),
        claimedCount: Number(info.claimedCount),
        active: info.active,
      };

      setPacketInfo(nextInfo);

      if (account) {
        const claimed = await contract.hasClaimed(packetId, account);
        setHasClaimed(claimed);
      } else {
        setHasClaimed(false);
      }
    } catch (err) {
      console.error(err);
      setError('无法获取红包信息');
    } finally {
      setIsLoading(false);
    }
  }, [account, packetId]);

  useEffect(() => {
    loadPacketInfo();
  }, [loadPacketInfo]);

  const handleClaim = async () => {
    setError('');
    setMessage('');

    if (!account) {
      setError('请先连接钱包');
      return;
    }

    if (!packetId || !packetInfo) {
      setError('红包信息不存在');
      return;
    }

    if (hasClaimed) {
      setError('您已经领取过该红包');
      return;
    }

    setClaimLoading(true);

    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      setMessage('正在发起领取交易...');
      const randomIndex = Math.floor(Math.random() * packetInfo.totalCount);
      const tx = await contract.claimRedPacket(packetId, randomIndex);

      setMessage('交易确认中，请留意钱包提示');
      await tx.wait();

      setMessage('🎉 领取成功，金额已发送至您的钱包');
      setHasClaimed(true);
      setTimeout(() => loadPacketInfo(), 2000);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : '领取红包失败';
      setError(message);
    } finally {
      setClaimLoading(false);
    }
  };

  const status = useMemo(() => {
    if (!packetInfo) return 'unknown';
    if (hasClaimed) return 'claimed';
    if (packetInfo.claimedCount >= packetInfo.totalCount) return 'finished';
    return 'available';
  }, [hasClaimed, packetInfo]);

  const canClaim = status === 'available';

  if (isLoading) {
    return (
      <div className="get-redpacket loading-container">
        <div className="spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!packetInfo) {
    return (
      <div className="get-redpacket error-container">
        <div className="bg-effect">
          {[...Array(6)].map((_, index) => (
            <div key={`coin-${index}`} className="decoration-item coin" />
          ))}
          {[...Array(4)].map((_, index) => (
            <div key={`packet-${index}`} className="decoration-item packet" />
          ))}
        </div>
        <div className="no-redpacket">
          <div className="empty-icon">📮</div>
          <div className="sub-tips">红包不存在或已过期</div>
        </div>
      </div>
    );
  }

  return (
    <div className="get-redpacket">
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

      <div className="redpacket-con">
        <div className="sharer">
          <div className="avatar-placeholder">🧧</div>
          <span className="name">{packetInfo.creator.slice(0, 8)}...的红包</span>
        </div>

        {canClaim && !message && (
          <div className="money">
            <span className="symbol">币</span>
            <span className="num">{packetInfo.totalAmount.toFixed(4)}</span>
          </div>
        )}

        {status !== 'available' && !message && (
          <div className="status">
            {status === 'claimed'
              ? '🎉 领取成功，金额已打入钱包'
              : '🎊 红包已被领取一空'}
          </div>
        )}

        {message && (
          <div className="status processing">
            <div className="message-text">{message}</div>
          </div>
        )}

        {error && (
          <div className="status error-text">
            ⚠️
            {error}
          </div>
        )}

        <div className="packet-details">
          <div className="detail-item">
            <span className="detail-label">总金额</span>
            <span className="detail-value">{packetInfo.totalAmount.toFixed(4)} BNB</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">数量</span>
            <span className="detail-value">{packetInfo.totalCount}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">已领取</span>
            <span className="detail-value">
              {packetInfo.claimedCount}/{packetInfo.totalCount}
            </span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${(packetInfo.claimedCount / Math.max(packetInfo.totalCount, 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="action-section">
          {!account ? (
            <button className="btn-open btn-connect" type="button" onClick={onConnect}>
              🔗 连接钱包
            </button>
          ) : canClaim ? (
            <button
              className={`btn-open ${claimLoading ? 'btn-loading' : ''}`}
              type="button"
              onClick={handleClaim}
              disabled={claimLoading}
            >
              {claimLoading ? '领取中...' : '点击领取'}
            </button>
          ) : (
            <button className="btn-open btn-disabled" type="button" disabled>
              {status === 'claimed' ? '✅ 已领取' : '🎊 红包抢完啦'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimPacket;
