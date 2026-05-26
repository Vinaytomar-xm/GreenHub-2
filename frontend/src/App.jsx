import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar             from './components/Navbar';
import Notification       from './components/Notification';
import Background         from './components/Background';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home        from './pages/Home';
import Marketplace from './pages/Marketplace';
import Trading     from './pages/Trading';
import Community   from './pages/Community';
import Dashboard   from './pages/Dashboard';
import SellEnergy  from './pages/SellEnergy';
import BuyEnergy   from './pages/BuyEnergy';
import Connect     from './pages/Connect';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import AdminPanel  from './pages/AdminPanel';
import Support     from './pages/Support';
import EnergyMap   from './pages/EnergyMap';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner" style={{ marginTop: '4rem' }} />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

function AppInner() {
  return (
    <NotificationProvider>
      <Background />
      <Navbar />
      <Notification />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/"            element={<Home />}        />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/trading"     element={<Trading />}     />
          <Route path="/community"   element={<Community />}   />
          <Route path="/dashboard"   element={<Dashboard />}   />
          <Route path="/sell-energy" element={<SellEnergy />}  />
          <Route path="/buy-energy"  element={<BuyEnergy />}   />
          <Route path="/connect"     element={<Connect />}     />
          <Route path="/login"       element={<Login />}       />
          <Route path="/signup"      element={<Signup />}      />
          <Route path="/support"     element={<Support />}     />
          <Route path="/energy-map"  element={<EnergyMap />}   />
          <Route path="/admin"       element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
      </main>

      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>⚡</span>
              <strong style={{ color: 'var(--green)', fontSize: '1.05rem' }}>GreenHub</strong>
            </div>
            <p style={{ color: 'var(--dim)', fontSize: '.82rem', maxWidth: '260px', lineHeight: 1.6 }}>
              India's decentralized renewable energy marketplace — buy, sell &amp; invest in green energy.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              { title: 'For You',  links: [['🔆 Sell Energy', '/sell-energy'], ['🛒 Buy Energy', '/buy-energy'], ['📈 Invest', '/connect?role=investor']] },
              { title: 'Explore',  links: [['Marketplace', '/marketplace'], ['P2P Trading', '/trading'], ['Community', '/community'], ['Dashboard', '/dashboard'], ['🗺 Energy Map', '/energy-map']] },
              { title: 'Support',  links: [['💬 Help & Support', '/support'], ['Connect', '/connect'], ['Login', '/login'], ['Sign Up', '/signup']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '.7rem' }}>{col.title}</div>
                {col.links.map(([label, href]) => (
                  <Link key={label} to={href}
                    style={{ display: 'block', color: 'var(--dim)', fontSize: '.85rem', marginBottom: '.4rem', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = 'var(--green)'}
                    onMouseLeave={e => e.target.style.color = 'var(--dim)'}>
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: '1400px', margin: '1.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: 'var(--dim)', fontSize: '.78rem' }}>© 2025 GreenHub — Renewable Energy Marketplace</p>
          <p style={{ color: 'var(--dim)', fontSize: '.78rem' }}>Decentralized Energy Exchange · P2P Green Energy Trading · Community Sustainability</p>
          <p style={{ color: 'var(--dim)', fontSize: '.78rem' }}>Made with ❤️ Vinay Singh Tomar</p>
        </div>
      </footer>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
