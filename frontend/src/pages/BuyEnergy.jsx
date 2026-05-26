import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducers, createBuyRequest } from '../api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const TYPE_COLOR = { Solar: '#fbbf24', Wind: '#38bdf8', Biogas: '#4ade80' };
const TYPE_ICON  = { Solar: '☀️',      Wind: '🌬️',      Biogas: '🌿' };
const BLANK_FORM = { buyerName: '', buyerEmail: '', buyerPhone: '', buyerType: 'Home', buyerCity: '', amount: '', duration: 'Monthly', message: '' };

export default function BuyEnergy() {
  const { notify }  = useNotification();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [producers,  setProducers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy,     setSortBy]     = useState('');
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchProducers = () => {
    setLoading(true); setError('');
    getProducers(filterType === 'All' ? undefined : filterType, sortBy || undefined)
      .then(r => setProducers(r.data.data || []))
      .catch(() => setError('Could not connect to the server. Please ensure the backend is running on port 5000.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducers(); }, [filterType, sortBy]);

  const shown = producers.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
  });

  const openModal = p => {
    if (!user) {
      notify('Please login to send a buy request. 🔐', 'error');
      navigate('/login?redirect=' + location.pathname);
      return;
    }
    setModal(p);
    setForm({ ...BLANK_FORM, buyerName: user.name || '', buyerEmail: user.email || '', buyerCity: user.city || '' });
    setSuccessMsg('');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async () => {
    if (!form.buyerName || !form.buyerEmail || !form.amount) {
      notify('Name, email and amount are required.', 'error'); return;
    }
    setSubmitting(true);
    try {
      const res = await createBuyRequest({ producerId: modal._id || modal.id, ...form, amount: parseFloat(form.amount), userId: user?._id || null });
      setSuccessMsg(res.data.message);
      notify(res.data.message);
      setModal(null);
    } catch (e) {
      notify(e.response?.data?.message || 'Request failed. Please try again.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', padding: '.35rem 1rem', background: 'rgba(56,189,248,.12)', border: '1px solid rgba(56,189,248,.3)', borderRadius: '20px', color: '#38bdf8', fontSize: '.8rem', fontWeight: 700, marginBottom: '1rem' }}>
          🛒 FOR CONSUMERS — HOME · FACTORY · OFFICE
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '.5rem' }}>Buy Green Energy</h1>
        <p style={{ color: 'var(--muted)' }}>Browse local producers and send buy requests directly — no middlemen, no broker fees</p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: 'var(--green)', fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchProducers} style={{ background: 'rgba(239,68,68,.2)', border: '1px solid rgba(239,68,68,.4)', color: '#f87171', borderRadius: '6px', padding: '.3rem .9rem', cursor: 'pointer', fontSize: '.82rem', fontFamily: 'var(--font)' }}>Retry</button>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name, location or type..."
          style={{ flex: 1, minWidth: '200px', padding: '.6rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', fontFamily: 'var(--font)' }} />
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
          {['All', 'Solar', 'Wind', 'Biogas'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ padding: '.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600, fontFamily: 'var(--font)', border: `1px solid ${filterType === t ? 'var(--green-border)' : 'var(--border)'}`, background: filterType === t ? 'var(--green-dim)' : 'transparent', color: filterType === t ? 'var(--green)' : 'var(--muted)' }}>
              {t}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '.5rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.85rem', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
          <option value="">Default Sort</option>
          <option value="price_asc">Price ↑ (Lowest first)</option>
          <option value="price_desc">Price ↓ (Highest first)</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <p style={{ color: 'var(--dim)', fontSize: '.82rem', marginBottom: '1.25rem' }}>
        <strong style={{ color: 'var(--blue)' }}>{shown.length}</strong> producers available
        {search && <span style={{ color: 'var(--muted)' }}> for "{search}"</span>}
      </p>

      {/* Producer grid */}
      {loading
        ? <div className="loading-spinner" />
        : shown.length === 0
          ? <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ color: 'var(--muted)' }}>{search ? `No producers found for "${search}"` : 'No producers available right now.'}</p>
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
              {shown.map(p => {
                const col = TYPE_COLOR[p.type];
                return (
                  <div key={p._id || p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ padding: '.25rem .75rem', borderRadius: '20px', fontSize: '.78rem', fontWeight: 700, background: `${col}22`, color: col, border: `1px solid ${col}` }}>
                        {TYPE_ICON[p.type]} {p.type}
                      </span>
                      {p.verified && <span style={{ fontSize: '.72rem', color: 'var(--green)', background: 'var(--green-dim)', border: '1px solid var(--green-border)', padding: '.2rem .6rem', borderRadius: '20px' }}>✓ Verified</span>}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{p.name}</h3>
                      <p style={{ fontSize: '.82rem', color: 'var(--dim)', marginTop: '.2rem' }}>📍 {p.location}</p>
                    </div>
                    <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{p.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.4rem' }}>
                      {[['Capacity', `${p.capacity} ${p.capacityUnit}`, 'var(--text)'], ['Available', `${p.available} kW`, 'var(--green)'], ['Price', `₹${p.price}/kWh`, 'var(--yellow)']].map(([l, v, c]) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,.03)', borderRadius: '8px', padding: '.5rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '.85rem', fontWeight: 700, color: c }}>{v}</div>
                          <div style={{ fontSize: '.68rem', color: 'var(--dim)', marginTop: '.15rem' }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '.5rem', borderTop: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--yellow)', fontSize: '.82rem' }}>{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))} {p.rating}</span>
                      <button onClick={() => openModal(p)}
                        style={{ padding: '.4rem 1.1rem', background: 'rgba(56,189,248,.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.35)', borderRadius: '6px', cursor: 'pointer', fontSize: '.85rem', fontWeight: 700, fontFamily: 'var(--font)' }}>
                        🛒 Buy Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
      }

      {/* Buy Request Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: '#0a1628', border: '1px solid var(--green-border)', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>📋 Send Buy Request</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1 }}>✕</button>
            </div>

            {/* Producer summary */}
            <div style={{ padding: '.85rem', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{modal.name}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{TYPE_ICON[modal.type]} {modal.type} · 📍 {modal.location}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--yellow)', fontSize: '1.1rem' }}>₹{modal.price}/kWh</div>
                <div style={{ fontSize: '.75rem', color: 'var(--green)' }}>{modal.available} kW available</div>
              </div>
            </div>

            {/* Form fields */}
            {[
              { label: 'Your Name *',  key: 'buyerName',  type: 'text',  ph: 'Full Name' },
              { label: 'Email *',      key: 'buyerEmail', type: 'email', ph: 'you@email.com' },
              { label: 'Phone',        key: 'buyerPhone', type: 'tel',   ph: '+91 98765 43210' },
              { label: 'Your City',    key: 'buyerCity',  type: 'text',  ph: 'e.g. Delhi' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.35rem', fontWeight: 500 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.ph}
                  style={{ width: '100%', padding: '.65rem .9rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.35rem', fontWeight: 500 }}>Consumer Type</label>
                <select value={form.buyerType} onChange={e => set('buyerType', e.target.value)} style={{ width: '100%', padding: '.65rem .9rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box' }}>
                  {['Home', 'Office', 'Factory', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.35rem', fontWeight: 500 }}>Duration</label>
                <select value={form.duration} onChange={e => set('duration', e.target.value)} style={{ width: '100%', padding: '.65rem .9rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box' }}>
                  {['One-time', 'Monthly', '3 Months', '6 Months', 'Yearly'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.35rem', fontWeight: 500 }}>Energy Amount (kWh) *</label>
              <input type="number" min="0.1" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="e.g. 100"
                style={{ width: '100%', padding: '.65rem .9rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box' }} />
              {form.amount && parseFloat(form.amount) > 0 && (
                <p style={{ marginTop: '.4rem', fontSize: '.78rem', color: 'var(--yellow)' }}>
                  Estimated cost: <strong>₹{(modal.price * parseFloat(form.amount)).toFixed(2)}</strong>
                  {' '}· CO₂ offset: <strong style={{ color: 'var(--green)' }}>~{(parseFloat(form.amount) * 0.82).toFixed(1)} kg</strong>
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.35rem', fontWeight: 500 }}>Message (optional)</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={3}
                placeholder="Any special requirements or questions..."
                style={{ width: '100%', padding: '.65rem .9rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ Sending...' : '📨 Send Buy Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
