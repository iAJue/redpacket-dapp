import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { useWallet } from './hooks/useWallet';
import { Home } from './pages/Home';
import { ClaimPacket } from './pages/ClaimPacket';
import { WalletConnect } from './components/WalletConnect';

const AppContent = () => {
  const { account, connect } = useWallet();
  const location = useLocation();
  const isClaimPage = location.pathname.startsWith('/claim/');

  return (
    <div className={`app ${isClaimPage ? 'claim-page' : ''}`}>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home account={account} onConnect={connect} />} />
          <Route
            path="/claim/:packetId"
            element={<ClaimPacket account={account} onConnect={connect} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isClaimPage && (
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} 链上红包 · 安全透明 · 去中心化</p>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
