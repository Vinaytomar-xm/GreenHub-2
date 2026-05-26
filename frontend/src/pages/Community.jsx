import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCommunities, joinCommunity } from '../api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const TYPE_ICONS = { 'Neighborhood Grid': '🏘️', 'Rural Co-op': '🌾', 'Industrial Cluster': '🏭', 'Residential Complex': '🏢', 'Corporate Cluster': '🏙️' };
const EMPTY_FORM = { name: '', email: '', phone: '', city: '', reason: '' };

export default function Community() {
  const { notify }  = useNotification();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [communities, setCommunities] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [joined,      setJoined]      = useState(new Set());
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    getCommunities().then(r => setCommunities(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openJoin = c => {
    if (!c.active) return;
    if (!user) {
      notify('Please login to join a community. 🔐', 'error');
      navigate('/login?redirect=' + location.pathname);
      return;
    }
    setForm({ name: user?.name || '', email: user?.email || '', phone: '', city: user?.city || '', reason: '' });
    setModal(c);
  };

  const handleJoinSubmit = async () => {
    if (!form.name || !form.email) return notify('Name and email are required.', 'error');
    setSubmitting(true);
    try {
      const res = await joinCommunity(modal.id, { ...form, userId: user?._id || null });
      setJoined(prev => new Set([...prev, modal.id]));
      setCommunities(prev => prev.map(x => x.id === modal.id ? { ...x, members: x.members + 1 } : x));
      notify(res.data.message);
      setModal(null);
    } catch (err) {
      notify(err.response?.data?.message || 'Could not join. Please try again.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', padding: '.4rem 1rem', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '20px', color: 'var(--green)', fontSize: '.82rem', marginBottom: '1rem' }}>
          🤝 Community-Based Sustainability
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '.5rem' }}>Power Your Community</h1>
        <p style={{ color: 'var(--muted)' }}>Join community energy groups — form micro-grids, co-ops, and industrial clusters.</p>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {communities.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem' }}>{TYPE_ICONS[c.type] || '⚡'}</span>
                <span style={{ padding: '.2rem .6rem', background: c.active ? 'var(--green-dim)' : 'rgba(255,255,255,0.05)', color: c.active ? 'var(--green)' : 'var(--dim)', border: `1px solid ${c.active ? 'var(--green-border)' : 'var(--border)'}`, borderRadius: '20px', fontSize: '.72rem', fontWeight: 700 }}>
                  {c.active ? '● Active' : '○ Inactive'}
                </span>
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>{c.name}</h3>
                <p style={{ color: 'var(--dim)', fontSize: '.8rem', marginTop: '.2rem' }}>📍 {c.region} · {c.type}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.4rem' }}>
                {[['Members', c.members, 'var(--blue)'], ['Energy', c.energySaved, 'var(--green)'], ['CO₂ Off', c.co2Offset, 'var(--yellow)']].map(([l, v, cl]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '7px', padding: '.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: cl }}>{v}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--dim)', marginTop: '.1rem' }}>{l}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => joined.has(c.id) ? null : openJoin(c)}
                disabled={!c.active}
                className={joined.has(c.id) ? '' : 'btn-secondary'}
                style={joined.has(c.id)
                  ? { padding: '.4rem .9rem', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)', borderRadius: '8px', fontSize: '.82rem', fontWeight: 700, cursor: 'default' }
                  : { width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                {joined.has(c.id) ? '✓ Joined!' : c.active ? 'Join Community →' : 'Coming Soon'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
        {[
          { icon: '📊', title: 'Impact Dashboard', desc: "Track your community's contribution to India's renewable energy goals with live data." },
          { icon: '🎓', title: 'Green Education Hub', desc: 'Learn about renewable technology, energy trading, and sustainability best practices.' },
          { icon: '💰', title: 'Investor Network', desc: 'Connect with green energy investors to fund new renewable projects in your area.' },
        ].map(i => (
          <div key={i.title} className="card" style={{ borderColor: 'rgba(56,189,248,0.2)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>{i.icon}</div>
            <h3 style={{ fontWeight: 700, marginBottom: '.4rem' }}>{i.title}</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>{i.desc}</p>
          </div>
        ))}
      </div>

      {/* Join Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--green-border)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '.3rem' }}>{TYPE_ICONS[modal.type] || '🤝'}</div>
                <h2 style={{ fontWeight: 900, fontSize: '1.15rem' }}>Join {modal.name}</h2>
                <p style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: '.2rem' }}>📍 {modal.region} · {modal.members} members</p>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '.75rem' }}>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name"
                    style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Email *</label>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" type="email"
                    style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '.75rem' }}>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210"
                    style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>City</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Your city"
                    style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.3rem' }}>Why do you want to join?</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Tell us about your interest in renewable energy..." rows={3}
                  style={{ width: '100%', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.87rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setModal(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', minWidth: '100px' }}>Cancel</button>
              <button onClick={handleJoinSubmit} disabled={submitting} className="btn-primary" style={{ flex: 2, justifyContent: 'center', minWidth: '140px' }}>
                {submitting ? '⏳ Joining...' : `🤝 Join ${modal.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
