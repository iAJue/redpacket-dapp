import { useEffect, useState } from 'react';
import { connectWallet, getAccount } from '../utils/web3';

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncAccount = async () => {
      const acc = await getAccount();
      if (mounted) {
        setAccount(acc);
      }
    };

    syncAccount();

    if (typeof window !== 'undefined' && window.ethereum?.on) {
      const handleAccountsChanged = (accounts: unknown) => {
        if (!Array.isArray(accounts) || !mounted) return;
        setAccount(accounts[0] ?? null);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        mounted = false;
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const connect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法连接钱包');
    } finally {
      setIsLoading(false);
    }
  };

  return { account, isLoading, error, connect };
};
