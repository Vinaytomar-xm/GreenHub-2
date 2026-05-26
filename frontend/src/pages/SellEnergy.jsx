import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createProducer } from '../api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Your Info', 'Energy Details', 'Pricing', 'Review & Submit'];
const BLANK = {
  ownerName: '', email: '', phone: '', location: '', ownerType: 'Individual (Homeowner)',
  name: '', type: 'Solar', description: '', capacity: '', capacityUnit: 'kW', available: '', price: '',
};

export default function SellEnergy() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { notify } = useNotification();
  const { user }  = useAuth();

  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canNext = [
    () => form.ownerName && form.email && form.phone && form.location,
    () => form.name && form.type && form.capacity && form.description,
    () => form.price && parseFloat(form.price) > 0,
    () => true,
  ];

  const submit = async () => {
    if (!user) {
      notify('Please login to register your energy listing. 🔐', 'error');
      navigate('/login?redirect=' + location.pathname);
      return;
    }
    setLoading(true);
    try {
      const res = await createProducer({
        ...form,
        capacity:  parseFloat(form.capacity),
        available: parseFloat(form.available || form.capacity),
        price:     parseFloat(form.price),
        userId:    user._id,
      });
      setDone(res.data);
      notify(res.data.message);
    } catch (e) {
      notify(e.response?.data?.message || 'Registration failed. Please ensure the backend is running.', 'error');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '540px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--green)', marginBottom: '1rem' }}>Registered Successfully!</h2>
      <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
        <strong style={{ color: 'var(--text)' }}>{form.name}</strong> has been submitted for review.<br />
        Our team will verify it within 24 hours and send a confirmation to <strong style={{ color: 'var(--text)' }}>{form.email}</strong>.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => navigate('/marketplace')}>View Marketplace →</button>
        <button className="btn-secondary" onClick={() => { setDone(null); setForm(BLANK); setStep(0); }}>Register Another</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', padding: '.35rem 1rem', background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.35)', borderRadius: '20px', color: '#fbbf24', fontSize: '.8rem', fontWeight: 700, marginBottom: '1rem' }}>
          ⚡ FOR PRODUCERS — SOLAR · WIND · BIOGAS
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '.5rem' }}>Sell Your Energy</h1>
        <p style={{ color: 'var(--muted)' }}>Register your renewable energy source and connect directly with consumers</p>
      </div>

      {/* Step progress bar */}
      <div style={{ display: 'flex', marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', padding: '.65rem .35rem', fontSize: '.72rem', fontWeight: 700, borderRight: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none', background: i === step ? 'var(--green-dim)' : i < step ? 'rgba(74,222,128,.04)' : 'transparent', color: i <= step ? 'var(--green)' : 'var(--dim)' }}>
            {i < step ? '✓ ' : i === step ? '→ ' : ''}{s}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem' }}>

        {/* STEP 0 — Personal Info */}
        {step === 0 && <>
          <h3 style={SH}>👤 Your Personal Information</h3>
          <FL label="Full Name *"><input style={IN} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="e.g. Ramesh Kumar" /></FL>
          <FL label="Email Address *"><input style={IN} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" /></FL>
          <FL label="Phone Number *"><input style={IN} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></FL>
          <FL label="City / State *"><input style={IN} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Jaipur, Rajasthan" /></FL>
          <FL label="You are a">
            <select style={IN} value={form.ownerType} onChange={e => set('ownerType', e.target.value)}>
              {['Individual (Homeowner)', 'Farmer', 'Business Owner', 'NGO', 'Government'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FL>
        </>}

        {/* STEP 1 — Energy Details */}
        {step === 1 && <>
          <h3 style={SH}>⚡ Energy Source Details</h3>
          <FL label="Listing Name *"><input style={IN} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. My Rooftop Solar — Jaipur" /></FL>
          <FL label="Energy Type *">
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              {[['Solar', '☀️'], ['Wind', '🌬️'], ['Biogas', '🌿']].map(([t, ic]) => (
                <button key={t} onClick={() => set('type', t)} style={{ flex: 1, minWidth: '80px', padding: '.8rem .5rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.9rem', textAlign: 'center', border: `2px solid ${form.type === t ? 'rgba(74,222,128,.5)' : 'var(--border)'}`, background: form.type === t ? 'var(--green-dim)' : 'var(--surface)', color: form.type === t ? 'var(--green)' : 'var(--muted)' }}>
                  {ic}<br /><span style={{ fontSize: '.72rem' }}>{t}</span>
                </button>
              ))}
            </div>
          </FL>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <FL label="Total Capacity *"><input style={IN} type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 100" /></FL>
            <FL label="Unit"><select style={IN} value={form.capacityUnit} onChange={e => set('capacityUnit', e.target.value)}>{['kW', 'MW', 'kWh/day'].map(u => <option key={u}>{u}</option>)}</select></FL>
          </div>
          <FL label="Available Capacity (leave blank to use full capacity)">
            <input style={IN} type="number" value={form.available} onChange={e => set('available', e.target.value)} placeholder={form.capacity || 'e.g. 80'} />
          </FL>
          <FL label="Description *">
            <textarea style={{ ...IN, height: '80px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your setup — e.g. '5 kW rooftop solar installed in 2022, located in Jaipur suburb'" />
          </FL>
        </>}

        {/* STEP 2 — Pricing */}
        {step === 2 && <>
          <h3 style={SH}>₹ Set Your Price</h3>
          <FL label="Price per kWh (₹) *">
            <input style={IN} type="number" step="0.1" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 4.5" />
          </FL>
          {form.price && parseFloat(form.price) > 0 && (
            <div style={{ padding: '1rem', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '.75rem' }}>💡 Market comparison:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem', textAlign: 'center', fontSize: '.82rem' }}>
                {[['Grid Rate', '₹6–8/kWh', 'var(--dim)'], ['Market Average', '₹3.5–5/kWh', 'var(--muted)'], ['Your Price', `₹${form.price}/kWh`, 'var(--green)']].map(([l, v, c]) => (
                  <div key={l} style={{ padding: '.5rem', background: 'rgba(255,255,255,.03)', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 800, color: c }}>{v}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--dim)', marginTop: '.15rem' }}>{l}</div>
                  </div>
                ))}
              </div>
              {form.capacity && <p style={{ marginTop: '.75rem', fontSize: '.82rem', color: 'var(--muted)' }}>If fully sold: <strong style={{ color: 'var(--yellow)' }}>₹{(parseFloat(form.price) * parseFloat(form.capacity)).toFixed(0)}/month potential</strong></p>}
            </div>
          )}
        </>}

        {/* STEP 3 — Review */}
        {step === 3 && <>
          <h3 style={SH}>✅ Review &amp; Submit</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.5rem' }}>
            {[['Owner', form.ownerName], ['Email', form.email], ['Phone', form.phone], ['Location', form.location], ['Listing Name', form.name], ['Energy Type', form.type], ['Capacity', `${form.capacity} ${form.capacityUnit}`], ['Available', `${form.available || form.capacity} ${form.capacityUnit}`], ['Price', `₹${form.price}/kWh`]].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.6rem .85rem', background: 'rgba(255,255,255,.02)', borderRadius: '7px', fontSize: '.88rem', flexWrap: 'wrap', gap: '.25rem' }}>
                <span style={{ color: 'var(--muted)' }}>{l}</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '.9rem 1rem', background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)', borderRadius: '8px', fontSize: '.83rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            ⚠️ After submission our team will verify your listing within 24 hours and send a confirmation email to <strong style={{ color: 'var(--text)' }}>{form.email}</strong>.
          </div>
        </>}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          {step > 0
            ? <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
            : <button className="btn-secondary" onClick={() => navigate('/')}>← Home</button>}
          {step < 3
            ? <button className="btn-primary" disabled={!canNext[step]()} onClick={() => setStep(s => s + 1)}>Continue →</button>
            : <button className="btn-primary" disabled={loading} onClick={submit}>{loading ? '⏳ Submitting...' : '🚀 Submit Listing'}</button>}
        </div>
      </div>
    </div>
  );
}

function FL({ label, children }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.4rem', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}
const SH = { fontWeight: 800, fontSize: '1.05rem', marginBottom: '1.5rem' };
const IN = { width: '100%', padding: '.7rem .9rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '.9rem', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box' };
