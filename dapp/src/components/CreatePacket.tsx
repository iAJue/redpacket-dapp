import { useState, type CSSProperties } from 'react';
import { ethers } from 'ethers';
import '../styles/CreatePacket.css';
import { getContract, getProvider, getTokenContract, toWei } from '../utils/web3';
import { ASSETS, type AssetOption } from '../config/assets';
import addresses from '../config/contractAddresses.json';
import { getFriendlyError } from '../utils/errors';

type CreatePacketProps = {
  account: string | null;
};

export const CreatePacket = ({ account }: CreatePacketProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [totalCount, setTotalCount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [error, setError] = useState('');
  const [asset, setAsset] = useState<AssetOption>(ASSETS[0]);

  const handleCreatePacket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatusMessage('');

    const amountNumber = Number(totalAmount);
    const countNumber = Number(totalCount);

    if (!account) {
      setError('请先连接钱包');
      return;
    }

    if (!amountNumber || !countNumber || amountNumber <= 0 || countNumber <= 0) {
      setError('请输入有效的红包金额与数量');
      return;
    }

    setIsLoading(true);

    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const decimals = asset.decimals;
      const randomAmounts: bigint[] = [];
      let remaining = amountNumber;

      const precision = Math.min(decimals, 6);

      for (let i = 0; i < countNumber - 1; i += 1) {
        const randomAmount = parseFloat((Math.random() * remaining * 0.3).toFixed(precision));
        randomAmounts.push(toWei(randomAmount || 0, decimals));
        remaining -= randomAmount;
      }

      randomAmounts.push(toWei(parseFloat(Math.max(remaining, 0).toFixed(precision)), decimals));

      const packetId = ethers.id(`${Date.now()}-${Math.random()}`);
      const totalUnits = randomAmounts.reduce((acc, value) => acc + value, 0n);

      if (!asset.isNative) {
        const provider = getProvider();
        const signer = await provider.getSigner();
        const tokenContract = getTokenContract(asset.address, signer);
        const allowance = await tokenContract.allowance(account, addresses.redPacket);
        if (allowance < totalUnits) {
          const approveTx = await tokenContract.approve(addresses.redPacket, totalUnits);
          setStatusMessage('授权代币中，请在钱包确认...');
          await approveTx.wait();
        }
      }

      const tx = await contract.createRedPacket(packetId, countNumber, randomAmounts, asset.address, {
        value: asset.isNative ? totalUnits : 0n,
      });

      setStatusMessage('⏳ 链上确认中，请在钱包内确认交易...');
      await tx.wait();

      setStatusMessage('✅ 红包创建成功');
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setShareLink(`${origin}/claim/${packetId}`);
      setTotalAmount('');
      setTotalCount('');
    } catch (err) {
      setError(getFriendlyError(err, '创建红包失败'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      alert('链接已复制，快分享给朋友吧！');
    } catch (err) {
      console.error(err);
      alert('复制失败，请手动复制链接');
    }
  };

  return (
    <div className="send-redpacket">
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
          <h1>🎊 链上红包</h1>
          <p>链上红包 · 安全透明 · 去中心化 · 和好友共享好运</p>
        </div>

        {!shareLink ? (
          <form onSubmit={handleCreatePacket} className="packet-form">
            <div className="form-group">
              <div className="form-group-inline">
                <label htmlFor="amount">总金额 ({asset.symbol})</label>
                <select
                  value={asset.address}
                  onChange={(event) => {
                    const nextAsset = ASSETS.find((item) => item.address === event.target.value);
                    if (nextAsset) {
                      setAsset(nextAsset);
                    }
                  }}
                >
                  {ASSETS.map((item) => (
                    <option key={item.address} value={item.address}>
                      {item.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <span className="currency-symbol">币</span>
                <input
                  id="amount"
                  type="number"
                  step="0.001"
                  value={totalAmount}
                  onChange={(event) => setTotalAmount(event.target.value)}
                  placeholder="输入金额"
                  disabled={isLoading}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="count">红包数量</label>
              <div className="input-wrapper">
                <span className="currency-symbol">🎁</span>
                <input
                  id="count"
                  type="number"
                  value={totalCount}
                  onChange={(event) => setTotalCount(event.target.value)}
                  placeholder="输入数量"
                  disabled={isLoading}
                  min="1"
                />
              </div>
            </div>

            {totalAmount && totalCount && Number(totalCount) > 0 && (
              <div className="summary-box">
                <div className="summary-item">
                  <span>总金额</span>
                  <strong>
                    {Number(totalAmount).toFixed(4)} {asset.symbol}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>预计均值</span>
                  <strong>
                    {(Number(totalAmount) / Math.max(Number(totalCount), 1)).toFixed(4)} {asset.symbol}
                  </strong>
                </div>
              </div>
            )}

            {statusMessage && <div className="message-box success">{statusMessage}</div>}
            {error && (
              <div className="message-box error">
                ⚠️
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !account}
              className={`btn-submit ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  处理中...
                </>
              ) : (
                <>🚀 发送红包</>
              )}
            </button>

            {!account && <div className="hint-box">💡 请先连接钱包以便创建红包</div>}
          </form>
        ) : (
          <div className="success-container">
            <div className="success-icon">🎉</div>
            <h2>红包已准备就绪</h2>
            <p>复制下方链接分享给好友，邀请他们来抢红包</p>

            <div className="share-section">
              <div className="share-link-box">
                <input type="text" value={shareLink} readOnly className="share-input" />
                <button type="button" onClick={handleCopyLink} className="btn-copy">
                  📋 复制链接
                </button>
              </div>
              <div className="share-qr-hint">你也可以直接发送到群聊或社交媒体</div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShareLink('');
                setStatusMessage('');
              }}
              className="btn-new-packet"
            >
              ↺ 继续发红包
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePacket;
