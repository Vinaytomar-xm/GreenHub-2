import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProducers, getTrades, createTrade } from '../api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLE = {
  completed: { bg: 'rgba(74,222,128,.15)', color: '#4ade80' },
  pending:   { bg: 'rgba(251,191,36,.15)', color: '#fbbf24' },
};

export default function Trading() {
  const { state }   = useLocation();
  const { notify }  = useNotification();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [producers,   setProducers]  = useState([]);
  const [trades,      setTrades]     = useState([]);
  const [selectedId,  setSelectedId] = useState(state?.producer?._id || state?.producer?.id?.toString() || '');
  const [consumer,    setConsumer]   = useState(user?.name || '');
  const [amount,      setAmount]     = useState('');
  const [loading,     setLoading]    = useState(false);

  const selected = producers.find(p => (p._id || p.id)?.toString() === selectedId);

  useEffect(() => {
    getProducers().then(r => setProducers(r.data.data)).catch(() => {});
    fetchTrades();
    const iv = setInterval(fetchTrades, 5000);
    return () => clearInterval(iv);
  }, []);

  const fetchTrades = () => getTrades(undefined, 10).then(r => setTrades(r.data.data)).catch(() => {});

  const handleSubmit = async () => {
    if (!user) {
      notify('Please login to initiate a trade. 🔐', 'error');
      navigate('/login?redirect=/trading');
      return;
    }
    if (!selectedId || !consumer.trim() || !amount) {
      notify('Please fill in all fields.', 'error'); return;
    }
    if (parseFloat(amount) <= 0) { notify('Please enter a valid amount.', 'error'); return; }
    setLoading(true);
    try {
      const selectedProducer = producers.find(p => (p._id || p.id)?.toString() === selectedId);
      const res = await createTrade({
        producerId: selectedProducer?._id || selectedProducer?.id || selectedId,
        consumer:   consumer.trim(),
        amount:     parseFloat(amount),
      });
      notify(res.data.message);
      setAmount('');
      fetchTrades();
    } catch (err) {
      notify(err.response?.data?.message || 'Trade failed. Please try again.', 'error');
    } finally { setLoading(false); }
  };

  const cost = selected && amount ? (selected.price * parseFloat(amount)).toFixed(2) : null;
  const co2  = amount ? (parseFloat(amount) * 0.82).toFixed(2) : null;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '.5rem' }}>P2P Energy Trading</h1>
        <p style={{ color: 'var(--muted)' }}>Initiate peer-to-peer green energy trades directly with producers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Order Form */}
        <div className="card" style={{ border: '1px solid var(--green-border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>⚡ Create Trade Order</h2>

          <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--muted)', marginBottom: '.4rem', fontWeight: 500 }}>Select Producer</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
            style={{ width: '100%', padding: '.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', marginBottom: '1.25rem', fontFamily: 'var(--font)' }}>
            <option value="">— Choose a producer —</option>
            {producers.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.type}) — ₹{p.price}/kWh</option>)}
          </select>

          {selected && (
            <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              {[
                ['Location', selected.location],
                ['Available', `${selected.available} kW`, 'var(--green)'],
                ['Price', `₹${selected.price}/kWh`, 'var(--yellow)'],
                ['Rating', `${'★'.repeat(Math.floor(selected.rating))} ${selected.rating}`, 'var(--yellow)'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '.3rem 0', color: 'var(--muted)' }}>
                  <span>{l}</span><span style={{ color: c || 'var(--text)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--muted)', marginBottom: '.4rem', fontWeight: 500 }}>Your Name / Organisation</label>
          <input value={consumer} onChange={e => setConsumer(e.target.value)} placeholder="e.g. My Home / Company Name"
            style={{ width: '100%', padding: '.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', marginBottom: '1.25rem', fontFamily: 'var(--font)', boxSizing: 'border-box' }} />

          <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--muted)', marginBottom: '.4rem', fontWeight: 500 }}>Energy Amount (kWh)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter kWh..."
            style={{ width: '100%', padding: '.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', marginBottom: '1.25rem', fontFamily: 'var(--font)', boxSizing: 'border-box' }} />

          {cost && (
            <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Estimated Cost</span>
                <span style={{ color: 'var(--yellow)', fontWeight: 800, fontSize: '1.1rem' }}>₹{cost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>CO₂ Offset</span>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>~{co2} kg</span>
              </div>
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Processing...' : 'Initiate Trade ⚡'}
          </button>
        </div>

        {/* Live Feed */}
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>🔄 Live Trade Feed</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {trades.length === 0
                ? <div style={{ color: 'var(--dim)', textAlign: 'center', padding: '2rem' }}>No trades yet.</div>
                : trades.map(t => (
                  <div key={t._id || t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', padding: '.9rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '.72rem', color: 'var(--dim)' }}>{t.tradeId || t.id}</span>
                      <span style={{ padding: '.15rem .5rem', borderRadius: '4px', fontSize: '.7rem', fontWeight: 700, ...(STATUS_STYLE[t.status] || {}) }}>{t.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.88rem', fontWeight: 600, marginBottom: '.3rem' }}>
                      <span style={{ color: 'var(--green)' }}>{t.producerName}</span>
                      <span style={{ color: 'var(--dim)' }}>→</span>
                      <span style={{ color: 'var(--blue)' }}>{t.consumer}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.82rem' }}>
                      <span style={{ color: 'var(--muted)' }}>{t.amount} kWh</span>
                      <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>₹{t.totalValue}</span>
                      <span style={{ color: 'var(--green)' }}>~{t.co2Offset || (t.amount * 0.82).toFixed(1)} kg CO₂</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Energy Mix — Live</h3>
            {[{ l: 'Solar ☀️', pct: 45, c: 'var(--yellow)' }, { l: 'Wind 🌬️', pct: 38, c: 'var(--blue)' }, { l: 'Biogas 🌿', pct: 17, c: 'var(--green)' }].map(b => (
              <div key={b.l} style={{ marginBottom: '.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.3rem' }}>
                  <span>{b.l}</span><span style={{ fontWeight: 700, color: b.c }}>{b.pct}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${b.pct}%`, background: b.c, borderRadius: '3px', transition: 'width 1s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
