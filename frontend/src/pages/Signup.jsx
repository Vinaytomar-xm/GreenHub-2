import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup as signupApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const USER_TYPES = [
  { id:'consumer', icon:'🏠', label:'Energy Consumer', desc:'Buy green energy for home/office' },
  { id:'producer', icon:'⚡', label:'Energy Producer',  desc:'Sell solar/wind/biogas energy'   },
  { id:'investor', icon:'💰', label:'Green Investor',   desc:'Invest in renewable projects'    },
];

export default function Signup() {
  const { login } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', userType:'consumer', city:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep]       = useState(1); // 1=type, 2=details
  const [err, setErr]         = useState('');

  const change = e => { setForm(p => ({...p, [e.target.name]:e.target.value})); setErr(''); };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setErr('Name, email and password are required.'); return; }
    if (form.password !== form.confirmPassword) { setErr('Passwords do not match.'); return; }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await signupApi({ name:form.name, email:form.email, password:form.password, userType:form.userType, city:form.city, phone:form.phone });
      login(res.data.user, res.data.token);
      notify(res.data.message);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Signup failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
      <div style={{ width:'100%', maxWidth:'500px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.8rem', marginBottom:'.5rem' }}>🌱</div>
          <h1 style={{ fontWeight:900, fontSize:'1.8rem', letterSpacing:'-1px', marginBottom:'.3rem' }}>
            Join <span style={{ background:'linear-gradient(135deg,#4ade80,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>GreenGrid</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:'.9rem' }}>Create your free account and start trading green energy</p>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1.75rem', justifyContent:'center' }}>
          {[1,2].map(s => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'.8rem', background:step>=s?'var(--green)':'var(--surface)', color:step>=s?'#000':'var(--muted)', border:`1px solid ${step>=s?'var(--green)':'var(--border)'}`, transition:'all .2s' }}>
                {step>s ? '✓' : s}
              </div>
              {s < 2 && <div style={{ width:'40px', height:'2px', background:step>s?'var(--green)':'var(--border)', transition:'background .2s' }} />}
            </div>
          ))}
          <div style={{ marginLeft:'.5rem', fontSize:'.78rem', color:'var(--muted)' }}>{step===1?'Choose Role':'Your Details'}</div>
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'18px', padding:'2rem' }}>
          {err && (
            <div style={{ padding:'.75rem 1rem', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'8px', color:'#f87171', fontSize:'.85rem', marginBottom:'1.25rem' }}>
              ⚠️ {err}
            </div>
          )}

          {/* Step 1 — Choose type */}
          {step === 1 && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1rem', marginBottom:'1.25rem' }}>Who are you?</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'.75rem', marginBottom:'1.5rem' }}>
                {USER_TYPES.map(t => (
                  <button key={t.id} onClick={() => setForm(p => ({...p, userType:t.id}))}
                    style={{ display:'flex', alignItems:'center', gap:'.9rem', padding:'1rem 1.25rem', borderRadius:'10px', border:`2px solid ${form.userType===t.id?'var(--green-border)':'var(--border)'}`, background:form.userType===t.id?'var(--green-dim)':'rgba(255,255,255,.02)', cursor:'pointer', transition:'all .15s', textAlign:'left' }}>
                    <span style={{ fontSize:'1.75rem' }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight:800, fontSize:'.9rem', color:form.userType===t.id?'var(--green)':'var(--text)' }}>{t.label}</div>
                      <div style={{ fontSize:'.78rem', color:'var(--muted)', marginTop:'.1rem' }}>{t.desc}</div>
                    </div>
                    {form.userType===t.id && <span style={{ marginLeft:'auto', color:'var(--green)', fontSize:'1.1rem' }}>✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'.75rem' }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1rem', marginBottom:'1.25rem' }}>Your Details</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'.9rem' }}>
                <div>
                  <label style={{ fontSize:'.75rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.3rem' }}>Full Name *</label>
                  <input name="name" value={form.name} onChange={change} placeholder="Ravi Sharma"
                    style={{ width:'100%', padding:'.7rem 1rem', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }}
                    onFocus={e => e.target.style.borderColor='var(--green-border)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div>
                  <label style={{ fontSize:'.75rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.3rem' }}>Email *</label>
                  <input name="email" value={form.email} onChange={change} type="email" placeholder="your@email.com"
                    style={{ width:'100%', padding:'.7rem 1rem', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }}
                    onFocus={e => e.target.style.borderColor='var(--green-border)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                  <div style={{ position:'relative' }}>
                    <label style={{ fontSize:'.75rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.3rem' }}>Password *</label>
                    <input name="password" value={form.password} onChange={change} type={showPwd?'text':'password'} placeholder="Min 6 chars"
                      style={{ width:'100%', padding:'.7rem 2.5rem .7rem 1rem', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }}
                      onFocus={e => e.target.style.borderColor='var(--green-border)'}
                      onBlur={e => e.target.style.borderColor='var(--border)'} />
                    <button onClick={() => setShowPwd(p => !p)} style={{ position:'absolute', right:'.6rem', bottom:'.7rem', background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'.85rem' }}>
                      {showPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                  <div>
                    <label style={{ fontSize:'.75rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.3rem' }}>Confirm Password *</label>
                    <input name="confirmPassword" value={form.confirmPassword} onChange={change} type="password" placeholder="Repeat password"
                      style={{ width:'100%', padding:'.7rem 1rem', background:'rgba(255,255,255,.04)', border:`1px solid ${form.confirmPassword&&form.confirmPassword!==form.password?'rgba(239,68,68,.5)':'var(--border)'}`, borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }}
                      onFocus={e => e.target.style.borderColor='var(--green-border)'}
                      onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                  <div>
                    <label style={{ fontSize:'.75rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.3rem' }}>City</label>
                    <input name="city" value={form.city} onChange={change} placeholder="Jaipur"
                      style={{ width:'100%', padding:'.7rem 1rem', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:'.75rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.3rem' }}>Phone</label>
                    <input name="phone" value={form.phone} onChange={change} placeholder="9876543210"
                      style={{ width:'100%', padding:'.7rem 1rem', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }} />
                  </div>
                </div>

                <div style={{ display:'flex', gap:'.75rem', marginTop:'.25rem' }}>
                  <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding:'.75rem 1rem' }}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'.75rem' }}>
                    {loading ? '⏳ Creating account...' : '🌱 Create Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'.85rem', color:'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--green)', fontWeight:700, textDecoration:'none' }}>Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
