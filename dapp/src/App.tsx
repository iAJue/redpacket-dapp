import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { useWallet } from './hooks/useWallet';
import { Home } from './pages/Home';
import { ClaimPacket } from './pages/ClaimPacket';

const AppContent = () => {
  const { account, connect, error } = useWallet();
  const location = useLocation();
  const isClaimPage = location.pathname.startsWith('/claim/');

  return (
    <div className={`app ${isClaimPage ? 'claim-page' : ''}`}>
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<Home account={account} onConnect={connect} connectError={error} />}
          />
          <Route
            path="/claim/:packetId"
            element={<ClaimPacket account={account} onConnect={connect} connectError={error} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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
