import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login as loginApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
  const { login }    = useAuth();
  const { notify }   = useNotification();
  const navigate     = useNavigate();
  const location     = useLocation();

  const redirectTo = new URLSearchParams(location.search).get('redirect') || null;

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [err,     setErr]     = useState('');

  const change = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(''); };

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setErr('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data.user, res.data.token);
      notify(res.data.message);
      if (redirectTo) navigate(redirectTo);
      else navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>⚡</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-1px', marginBottom: '.3rem' }}>
            Welcome <span style={{ color: 'var(--green)' }}>Back</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Login to your GreenHub account</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '2rem' }}>
          {err && (
            <div style={{ padding: '.75rem 1rem', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '8px', color: '#f87171', fontSize: '.85rem', marginBottom: '1.25rem', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
              ⚠️ {err}
            </div>
          )}

          {redirectTo && (
            <div style={{ marginBottom: '1rem', padding: '.75rem 1rem', background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.25)', borderRadius: '8px', color: '#38bdf8', fontSize: '.82rem', textAlign: 'center' }}>
              🔐 Please login to continue. You will be redirected back after signing in.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.35rem' }}>Email Address</label>
              <input name="email" value={form.email} onChange={change} type="email" placeholder="your@email.com"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '.7rem 1rem', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--green-border)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            <div>
              <label style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '.35rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input name="password" value={form.password} onChange={change} type={showPwd ? 'text' : 'password'} placeholder="Your password"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ width: '100%', padding: '.7rem 2.8rem .7rem 1rem', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--green-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.9rem', padding: 0 }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '.8rem', fontSize: '.95rem', marginTop: '.25rem' }}>
              {loading ? '⏳ Logging in...' : '🔑 Login to GreenHub'}
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '.75rem', background: 'rgba(167,139,250,.07)', border: '1px solid rgba(167,139,250,.2)', borderRadius: '8px', fontSize: '.78rem', color: 'var(--muted)', textAlign: 'center' }}>
            🛡️ Admin use: <strong style={{ color: '#a78bfa' }}>plz enter email:</strong> / <strong style={{ color: '#a78bfa' }}> Password:</strong>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.85rem', color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>Sign Up Free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
