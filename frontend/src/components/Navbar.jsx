import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/marketplace', label: '🏪 Marketplace' },
  { to: '/trading',     label: '🔄 Trading'     },
  { to: '/community',   label: '🤝 Community'   },
  { to: '/dashboard',   label: '📊 Dashboard'   },
  { to: '/energy-map',  label: '🗺️ Energy Map'  },
  { to: '/support',     label: '💬 Support'     },
  { to: '/sell-energy', label: '🔆 Sell Energy' },
  { to: '/buy-energy',  label: '🛒 Buy Energy'  },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const [scrolled,    setScrolled]    = useState(false);
  const [tick,        setTick]        = useState(true);
  const [menuOpen,    setMenuOpen]    = useState(false);  // hamburger menu
  const [dropOpen,    setDropOpen]    = useState(false);  // desktop user dropdown
  const [mobile,      setMobile]      = useState(window.innerWidth < 768);

  const menuRef = useRef(null);
  const dropRef = useRef(null);

  /* Close menu on route change */
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      setMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    const iv = setInterval(() => setTick(t => !t), 900);

    /* Click outside to close dropdowns */
    const onClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (dropRef.current && !dropRef.current.contains(e.target))  setDropOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', onClickOutside);
      clearInterval(iv);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setDropOpen(false);
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    padding: '.45rem .9rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '.82rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    color:      isActive ? 'var(--green)' : 'var(--muted)',
    background: isActive ? 'var(--green-dim)' : 'transparent',
    border:     isActive ? '1px solid var(--green-border)' : '1px solid transparent',
    transition: 'all .2s',
  });

  const adminLinkStyle = ({ isActive }) => ({
    padding: '.45rem .9rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '.82rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color:      '#a78bfa',
    background: isActive ? 'rgba(167,139,250,.15)' : 'rgba(167,139,250,.07)',
    border:     isActive ? '1px solid rgba(167,139,250,.4)' : '1px solid rgba(167,139,250,.2)',
    transition: 'all .2s',
  });

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', height: '64px',
        background: scrolled ? 'rgba(5,15,26,0.97)' : 'rgba(5,15,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(74,222,128,0.12)',
        transition: 'background .3s',
        gap: '1rem',
      }}>

        {/* ── Logo ── */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green)', letterSpacing: '-.5px' }}>GreenHub</span>
          <span style={{ fontSize: '.55rem', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)', borderRadius: '4px', padding: '2px 5px', letterSpacing: '1px', display: mobile ? 'none' : 'inline' }}>
            BETA
          </span>
        </NavLink>

        {/* ── Desktop nav links (hidden below 768px) ── */}
        {!mobile && (
          <div style={{ display: 'flex', gap: '.15rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
            {NAV_LINKS.slice(0, 5).map(n => (
              <NavLink key={n.to} to={n.to} style={navLinkStyle}>{n.label}</NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" style={adminLinkStyle}>🛡️ Admin</NavLink>
            )}
          </div>
        )}

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>

          {/* Live pulse — desktop only */}
          {!mobile && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.7rem', color: 'var(--green)', fontWeight: 700, letterSpacing: '1px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', opacity: tick ? 1 : 0.3, transition: 'opacity .3s' }} />
              LIVE
            </span>
          )}

          {/* Desktop quick buttons */}
          {!mobile && (
            <>
              <button onClick={() => navigate('/sell-energy')}
                style={{ padding: '.38rem .85rem', background: 'rgba(251,191,36,.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.35)', borderRadius: '6px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, fontFamily: 'var(--font)', transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,.12)'}>
                🔆 Sell
              </button>
              <button onClick={() => navigate('/buy-energy')}
                style={{ padding: '.38rem .85rem', background: 'rgba(56,189,248,.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.35)', borderRadius: '6px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, fontFamily: 'var(--font)', transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(56,189,248,.12)'}>
                🛒 Buy
              </button>
            </>
          )}

          {/* ── Auth buttons / User avatar (always visible) ── */}
          {user ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button onClick={() => { setDropOpen(p => !p); setMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.38rem .7rem', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--green)', fontWeight: 700, fontSize: '.8rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg,#4ade80,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: '.68rem', flexShrink: 0 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {!mobile && <span>{user.name?.split(' ')[0]}</span>}
                <span style={{ fontSize: '.65rem', opacity: 0.7 }}>▾</span>
              </button>

              {dropOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '.5rem', minWidth: '190px', boxShadow: '0 10px 30px rgba(0,0,0,.5)', zIndex: 200 }}>
                  <div style={{ padding: '.6rem .75rem', borderBottom: '1px solid var(--border)', marginBottom: '.4rem' }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{user.email}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--green)', marginTop: '.2rem', textTransform: 'capitalize' }}>{user.userType} · {user.role}</div>
                  </div>
                  {[
                    ['📊 Dashboard',   '/dashboard'],
                    ['🔆 Sell Energy', '/sell-energy'],
                    ['🛒 Buy Energy',  '/buy-energy'],
                    ['🤝 Community',   '/community'],
                    ['💬 Support',     '/support'],
                    ...(isAdmin ? [['🛡️ Admin Panel', '/admin']] : []),
                  ].map(([label, path]) => (
                    <button key={path} onClick={() => { navigate(path); setDropOpen(false); }}
                      style={{ display: 'block', width: '100%', padding: '.5rem .75rem', background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.83rem', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--green-dim)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '.4rem', paddingTop: '.4rem' }}>
                    <button onClick={handleLogout}
                      style={{ display: 'block', width: '100%', padding: '.5rem .75rem', background: 'transparent', border: 'none', color: '#f87171', fontFamily: 'var(--font)', fontSize: '.83rem', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '.4rem' }}>
              <button onClick={() => navigate('/login')}
                className="btn-secondary"
                style={{ padding: '.38rem .85rem', fontSize: '.82rem' }}>
                Login
              </button>
              <button onClick={() => navigate('/signup')}
                className="btn-primary"
                style={{ padding: '.38rem .85rem', fontSize: '.82rem' }}>
                Sign Up
              </button>
            </div>
          )}

          {/* ── Hamburger button (mobile only, shown when logged out too) ── */}
          {mobile && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setMenuOpen(p => !p); setDropOpen(false); }}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '5px', width: '38px', height: '38px', background: menuOpen ? 'var(--green-dim)' : 'var(--surface)', border: `1px solid ${menuOpen ? 'var(--green-border)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', padding: '8px', transition: 'all .2s' }}
                aria-label="Toggle menu">
                <span style={{ display: 'block', width: '18px', height: '2px', background: menuOpen ? 'var(--green)' : 'var(--muted)', borderRadius: '2px', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', transition: 'all .25s' }} />
                <span style={{ display: 'block', width: '18px', height: '2px', background: menuOpen ? 'var(--green)' : 'var(--muted)', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'all .25s' }} />
                <span style={{ display: 'block', width: '18px', height: '2px', background: menuOpen ? 'var(--green)' : 'var(--muted)', borderRadius: '2px', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', transition: 'all .25s' }} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ══ Mobile dropdown menu ══════════════════════════════════════════════ */}
      {mobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'rgba(5,15,26,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(74,222,128,0.15)',
          zIndex: 99,
          padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '.4rem',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          animation: 'fadeInDown .2s ease',
        }}>
          {/* All nav links */}
          {NAV_LINKS.map(n => (
            <NavLink key={n.to} to={n.to}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'block', padding: '.75rem 1rem',
                borderRadius: '8px', textDecoration: 'none',
                fontSize: '.9rem', fontWeight: 600,
                color:      isActive ? 'var(--green)' : 'var(--text)',
                background: isActive ? 'var(--green-dim)' : 'transparent',
                border:     isActive ? '1px solid var(--green-border)' : '1px solid transparent',
              })}>
              {n.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'block', padding: '.75rem 1rem',
                borderRadius: '8px', textDecoration: 'none',
                fontSize: '.9rem', fontWeight: 700,
                color: '#a78bfa',
                background: isActive ? 'rgba(167,139,250,.15)' : 'rgba(167,139,250,.07)',
                border: isActive ? '1px solid rgba(167,139,250,.4)' : '1px solid rgba(167,139,250,.2)',
              })}>
              🛡️ Admin Panel
            </NavLink>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '.4rem 0' }} />

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', fontSize: '.8rem', color: 'var(--green)', fontWeight: 700 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', opacity: tick ? 1 : 0.3, transition: 'opacity .3s' }} />
            LIVE — Platform is active
          </div>

          {/* If not logged in, show auth buttons */}
          {!user && (
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.25rem' }}>
              <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '.7rem' }}>
                Login
              </button>
              <button onClick={() => { navigate('/signup'); setMenuOpen(false); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '.7rem' }}>
                Sign Up
              </button>
            </div>
          )}

          {/* If logged in, show logout */}
          {user && (
            <button onClick={handleLogout}
              style={{ padding: '.75rem 1rem', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: '8px', color: '#f87171', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', textAlign: 'left' }}>
              🚪 Logout ({user.name?.split(' ')[0]})
            </button>
          )}
        </div>
      )}

      {/* Overlay to close menu */}
      {mobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, top: '64px', zIndex: 98, background: 'rgba(0,0,0,.3)' }}
        />
      )}
    </>
  );
}
