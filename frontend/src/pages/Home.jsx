import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, submitSupport } from '../api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate   = useNavigate();
  const { notify } = useNotification();
  const { user }   = useAuth();

  const [stats,       setStats]       = useState(null);
  const [openRole,    setOpenRole]    = useState(null);
  const [helpForm,    setHelpForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [helpLoading, setHelpLoading] = useState(false);

  useEffect(() => {
    if (user) setHelpForm(p => ({ ...p, name: user.name || '', email: user.email || '' }));
  }, [user]);

  useEffect(() => {
    getStats().then(r => setStats(r.data.data)).catch(() => {});
    const iv = setInterval(() => getStats().then(r => setStats(r.data.data)).catch(() => {}), 8000);
    return () => clearInterval(iv);
  }, []);

  const handleHelpSubmit = async () => {
    if (!helpForm.name || !helpForm.email || !helpForm.subject || !helpForm.message)
      return notify('Please fill in all fields.', 'error');
    setHelpLoading(true);
    try {
      const res = await submitSupport({ ...helpForm, category: 'Other', userId: user?._id || null });
      notify(res.data.message);
      setHelpForm({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to send. Please try again.', 'error');
    } finally { setHelpLoading(false); }
  };

  const ROLES = [
    {
      id: 'producer', icon: '⚡', title: 'Energy Producer',
      sub: 'Solar Rooftop · Wind Farm · Biogas Plant',
      color: '#fbbf24', glow: 'rgba(251,191,36,.15)', border: 'rgba(251,191,36,.4)',
      desc: 'Have solar panels, wind turbines or a biogas plant? Sell your extra electricity directly to consumers — no broker, direct payment.',
      bullets: ['Register your energy source', 'Set your own price (₹/kWh)', 'Connect directly with buyers', 'Verification within 24 hours'],
      cta: '🔆 Sell My Energy', route: '/sell-energy',
    },
    {
      id: 'consumer', icon: '🏠', title: 'Energy Consumer',
      sub: 'Home · Factory · Office',
      color: '#38bdf8', glow: 'rgba(56,189,248,.15)', border: 'rgba(56,189,248,.4)',
      desc: 'Buy affordable, clean green energy for your home, office or factory. Directly from local producers — cheaper than the grid, better for the environment.',
      bullets: ['Browse nearby producers', 'Compare prices in real time', 'Send buy requests directly', 'Track your CO₂ savings'],
      cta: '🛒 Buy Green Energy', route: '/buy-energy',
    },
    {
      id: 'investor', icon: '💰', title: 'Green Investor',
      sub: 'Solar · Wind · Biogas Projects',
      color: '#4ade80', glow: 'rgba(74,222,128,.15)', border: 'rgba(74,222,128,.4)',
      desc: 'Invest in renewable energy projects and earn sustainable returns. Be part of India\'s green energy future.',
      bullets: ['Browse verified projects', 'Choose your investment amount', 'Track project progress', '12–18% annual returns expected'],
      cta: '📈 Invest Now', route: '/connect?role=investor',
    },
  ];

  return (
    <div className="fade-in">

      {/* Hero */}
      <section style={{ padding: '4.5rem 0 2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.4rem 1.1rem', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '20px', color: 'var(--green)', fontSize: '.82rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          🌍 India's Decentralized Renewable Energy Marketplace
        </div>

        <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '1.25rem' }}>
          Buy &amp; Sell{' '}
          <span style={{ background: 'linear-gradient(135deg,#4ade80,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Green Energy
          </span>
          {' '}Directly
        </h1>

        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2.5rem' }}>
          Connect solar owners, wind farms &amp; biogas plants with consumers &amp; investors directly.{' '}
          <strong style={{ color: 'var(--text)' }}>No middlemen. No broker fees. 100% green.</strong>
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button onClick={() => navigate('/sell-energy')}
            style={{ padding: '.9rem 2.2rem', borderRadius: '10px', fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#d97706,#fbbf24)', color: '#000', boxShadow: '0 4px 20px rgba(251,191,36,.35)', transition: 'transform .15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            🔆 Sell My Energy
          </button>
          <button onClick={() => navigate('/buy-energy')}
            style={{ padding: '.9rem 2.2rem', borderRadius: '10px', fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#0369a1,#38bdf8)', color: '#fff', boxShadow: '0 4px 20px rgba(56,189,248,.35)', transition: 'transform .15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            🛒 Buy Green Energy
          </button>
          <button onClick={() => navigate('/connect?role=investor')}
            style={{ padding: '.9rem 2.2rem', borderRadius: '10px', fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', background: 'transparent', color: 'var(--green)', border: '2px solid var(--green-border)', transition: 'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--green-dim)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            📈 Invest in Green Energy
          </button>
        </div>

        {/* Live stats strip */}
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '⚡', val: stats ? `${(stats.energyTradedToday / 1000).toFixed(1)} MWh` : '—', label: 'Traded Today', pulse: true },
            { icon: '🌿', val: stats ? `${(stats.co2SavedToday / 1000).toFixed(1)} tons`  : '—', label: 'CO₂ Saved' },
            { icon: '🏭', val: stats ? stats.totalProducers                               : '—', label: 'Producers' },
            { icon: '🔄', val: stats ? stats.totalTrades                                  : '—', label: 'Trades Done' },
            { icon: '🤝', val: stats ? (stats.totalConnections || 0)                      : '—', label: 'Connections' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '.7rem 1.1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', minWidth: '100px', position: 'relative' }}>
              {s.pulse && <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' }} />}
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--green)' }}>{s.val}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.2rem' }}>{s.icon} {s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Who are you? */}
      <section style={{ margin: '3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-.5px', marginBottom: '.4rem' }}>Who Are You?</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.95rem' }}>Click your role to see how GreenHub works for you</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem' }}>
          {ROLES.map(r => (
            <div key={r.id} onClick={() => setOpenRole(openRole === r.id ? null : r.id)}
              style={{ padding: '1.85rem', borderRadius: '16px', cursor: 'pointer', background: openRole === r.id ? r.glow : 'var(--surface)', border: `2px solid ${openRole === r.id ? r.border : 'var(--border)'}`, transition: 'all .2s', transform: openRole === r.id ? 'translateY(-4px)' : 'none', boxShadow: openRole === r.id ? `0 10px 35px ${r.glow}` : 'none' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{r.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: openRole === r.id ? r.color : 'var(--text)', marginBottom: '.25rem' }}>{r.title}</h3>
              <p style={{ fontSize: '.75rem', color: r.color, fontWeight: 700, letterSpacing: '.5px', marginBottom: '.85rem' }}>{r.sub}</p>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</p>
              {openRole === r.id && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${r.border}` }}>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                    {r.bullets.map((b, i) => (
                      <li key={i} style={{ fontSize: '.85rem', color: 'var(--text)', display: 'flex', gap: '.55rem', alignItems: 'flex-start' }}>
                        <span style={{ color: r.color, fontWeight: 700, flexShrink: 0, marginTop: '.05rem' }}>✓</span>{b}
                      </li>
                    ))}
                  </ul>
                  <button onClick={e => { e.stopPropagation(); navigate(r.route); }}
                    style={{ width: '100%', padding: '.75rem', borderRadius: '8px', border: `2px solid ${r.border}`, background: r.glow, color: r.color, fontFamily: 'var(--font)', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer' }}>
                    {r.cta}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ margin: '3rem 0', padding: '2.5rem 2rem', background: 'linear-gradient(135deg,rgba(5,150,105,.06),rgba(56,189,248,.04))', border: '1px solid rgba(74,222,128,.12)', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', marginBottom: '2rem' }}>⚡ How Does It Work?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1.5rem' }}>
          {[
            { n: '01', icon: '📝', title: 'Register',      desc: 'Producer, Consumer or Investor — free registration in 2 minutes.' },
            { n: '02', icon: '🔍', title: 'Browse / List',  desc: 'Producers list their energy. Consumers discover nearby green sources.' },
            { n: '03', icon: '📨', title: 'Send Request',   desc: 'Submit a buy request or connect form directly to a producer.' },
            { n: '04', icon: '⚡', title: 'Trade',          desc: 'Request approved — energy transfer and payment happens directly.' },
            { n: '05', icon: '🌿', title: 'Track Impact',   desc: 'Track your CO₂ savings and contribution to a cleaner India.' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.68rem', color: 'var(--green)', fontWeight: 800, letterSpacing: '2px', marginBottom: '.5rem' }}>STEP {s.n}</div>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{s.icon}</div>
              <h4 style={{ fontWeight: 800, fontSize: '.95rem', marginBottom: '.35rem' }}>{s.title}</h4>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ margin: '3rem 0 2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', marginBottom: '1.75rem' }}>Platform Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
          {[
            { icon: '🔆', title: 'Sell Energy Page',   desc: 'Producers list their electricity — price, capacity, location and more.', color: 'var(--yellow)' },
            { icon: '🛒', title: 'Buy Energy Page',    desc: 'Consumers browse nearby producers and send buy requests directly.',       color: 'var(--blue)'   },
            { icon: '🤝', title: 'Connect Form',       desc: 'Dedicated forms for consumers, producers and investors.',                  color: 'var(--green)'  },
            { icon: '💰', title: 'Investor Portal',    desc: 'Invest in renewable projects and earn sustainable returns.',               color: 'var(--yellow)' },
            { icon: '🔄', title: 'P2P Trading Engine', desc: 'Direct trades with real-time pricing and auto-completion in 5 seconds.',   color: 'var(--green)'  },
            { icon: '🌍', title: 'CO₂ Impact Tracker', desc: 'Real-time carbon offset per trade — see your green contribution.',        color: 'var(--green)'  },
            { icon: '✓',  title: 'Verified Producers', desc: 'Trust verified-badge producers — quality and reliability guaranteed.',    color: 'var(--blue)'   },
            { icon: '📊', title: 'Live Dashboard',     desc: 'Trade history, energy mix, portfolio and environmental impact in one place.', color: 'var(--blue)' },
          ].map(f => (
            <div key={f.title} className="card" style={{ borderLeft: `3px solid ${f.color}` }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '.6rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.35rem' }}>{f.title}</h3>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Energy Map CTA */}
      <section style={{ margin: '3rem 0', borderRadius: '18px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,rgba(5,150,105,.12),rgba(56,189,248,.08),rgba(74,222,128,.06))', border: '1px solid var(--green-border)', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>🗺️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-.5px', marginBottom: '.5rem' }}>
          Live <span style={{ color: 'var(--green)' }}>Energy Map</span> of India
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '.92rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.65 }}>
          See real-time energy generation vs demand across Indian cities. Green = Surplus · Red = Deficit · Yellow = Balanced.
        </p>
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[['🟢', 'High Renewable Generation'], ['🔴', 'High Energy Demand'], ['🟡', 'Balanced Zone']].map(([dot, label]) => (
            <span key={label} style={{ padding: '.35rem .85rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '.78rem', color: 'var(--muted)' }}>{dot} {label}</span>
          ))}
        </div>
        <button onClick={() => navigate('/energy-map')} className="btn-primary" style={{ padding: '.8rem 2rem', fontSize: '.95rem' }}>
          🗺️ View Live Energy Map →
        </button>
      </section>

      {/* Help section */}
      <section style={{ margin: '3rem 0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.4rem 1rem', background: 'rgba(56,189,248,.1)', border: '1px solid rgba(56,189,248,.3)', borderRadius: '20px', color: '#38bdf8', fontSize: '.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            💬 CUSTOMER SUPPORT
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-.5px', marginBottom: '.4rem' }}>Need Help? Ask Us Anything</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.92rem' }}>We respond within 24 hours. Fill out the quick form below or visit the full support page.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Quick form */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem' }}>📝 Quick Help Form</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '.75rem' }}>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Name *</label>
                  <input value={helpForm.name} onChange={e => setHelpForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name"
                    style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Email *</label>
                  <input value={helpForm.email} onChange={e => setHelpForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" type="email"
                    style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Subject *</label>
                <input value={helpForm.subject} onChange={e => setHelpForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description..."
                  style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Message *</label>
                <textarea value={helpForm.message} onChange={e => setHelpForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe your question or issue..." rows={3}
                  style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <button onClick={handleHelpSubmit} disabled={helpLoading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: '120px' }}>
                  {helpLoading ? '⏳ Sending...' : '🚀 Send Query'}
                </button>
                <button onClick={() => navigate('/support')} className="btn-secondary">Full Help →</button>
              </div>
            </div>
          </div>

          {/* Support categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '⚡', title: 'Trading Support',  desc: 'Buy/sell requests, trade issues, pricing disputes.',    time: '2–4 hrs',  color: '#fbbf24' },
              { icon: '💳', title: 'Payment Help',      desc: 'Payment not received, refunds, billing queries.',       time: '4–8 hrs',  color: '#4ade80' },
              { icon: '🔧', title: 'Technical Issues',  desc: 'Platform bugs, login issues, dashboard problems.',      time: '4–8 hrs',  color: '#38bdf8' },
              { icon: '👤', title: 'Account Queries',   desc: 'Profile, verification, password reset, access issues.', time: '8–12 hrs', color: '#a78bfa' },
            ].map(s => (
              <div key={s.title} onClick={() => navigate('/support')} className="card"
                style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', borderLeft: `3px solid ${s.color}`, padding: '1rem 1.25rem' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.2rem', flexWrap: 'wrap', gap: '.25rem' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '.88rem', color: s.color }}>{s.title}</h4>
                    <span style={{ fontSize: '.7rem', color: 'var(--dim)' }}>~{s.time}</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.45 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
