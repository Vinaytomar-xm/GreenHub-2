import { useState } from 'react';
import { submitSupport } from '../api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Trading', 'Payment', 'Technical', 'Account', 'Other'];

const FAQ = [
  { q: 'How do I start selling my solar energy?', a: 'Go to "Sell Energy" page, fill in your producer details — name, location, capacity and price. After submission, our admin team verifies your listing within 24 hours.' },
  { q: 'How does payment work after a trade?', a: 'After a trade is initiated and completed (usually within 5 seconds of confirmation), payment is processed directly between buyer and producer. No middlemen involved.' },
  { q: 'Is my data secure on GreenGrid?', a: 'Yes! We use industry-standard JWT authentication, bcrypt password hashing, and HTTPS encryption. Your data is stored securely in MongoDB.' },
  { q: 'How do I join a community energy group?', a: 'Head to the "Community" page, browse available groups in your region, and click "Join Community". Fill in the quick form and you\'re in!' },
  { q: 'Can I track my CO₂ savings?', a: 'Absolutely! Your dashboard shows real-time CO₂ offset calculations for every trade you complete. Every kWh traded = 0.82 kg CO₂ saved.' },
  { q: 'Who can become a Green Investor?', a: 'Anyone! Go to Connect → Investor, fill in your details, and our team will reach out with verified renewable projects offering 12–18% annual returns.' },
];

export default function Support() {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [form, setForm] = useState({
    name:     user?.name  || '',
    email:    user?.email || '',
    category: 'Other',
    subject:  '',
    message:  '',
  });
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [openFaq, setOpenFaq]   = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'faq'

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message)
      return notify('Please fill all required fields.', 'error');
    setLoading(true);
    try {
      const res = await submitSupport({ ...form, userId: user?._id || null });
      setSubmitted(res.data);
      notify(res.data.message);
    } catch (err) {
      notify(err.response?.data?.message || 'Submission failed. Try again.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div style={{ marginBottom:'2rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.35rem 1rem', background:'rgba(56,189,248,.1)', border:'1px solid rgba(56,189,248,.3)', borderRadius:'20px', color:'#38bdf8', fontSize:'.78rem', fontWeight:700, marginBottom:'1rem' }}>
          💬 CUSTOMER SUPPORT
        </div>
        <h1 style={{ fontSize:'2rem', fontWeight:900, letterSpacing:'-1px', marginBottom:'.4rem' }}>
          Ask <span style={{ background:'linear-gradient(135deg,#4ade80,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Query</span> / Help
        </h1>
        <p style={{ color:'var(--muted)', fontSize:'.92rem', maxWidth:'500px' }}>
          Have a question or issue? We're here to help. Submit a ticket and our team will respond within 24 hours.
        </p>
      </div>

      {/* ── Quick Help Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
        {[
          { icon:'⚡', label:'Trading Issues',   cat:'Trading',   color:'#fbbf24' },
          { icon:'💳', label:'Payment Problems', cat:'Payment',   color:'#4ade80' },
          { icon:'🔧', label:'Technical Help',   cat:'Technical', color:'#38bdf8' },
          { icon:'👤', label:'Account Support',  cat:'Account',   color:'#a78bfa' },
          { icon:'❓', label:'Other Queries',    cat:'Other',     color:'var(--muted)' },
        ].map(c => (
          <button key={c.cat}
            onClick={() => { setForm(p => ({ ...p, category:c.cat })); setActiveTab('form'); }}
            style={{ padding:'1.1rem', borderRadius:'10px', border:`1px solid ${form.category===c.cat?c.color+'80':'var(--border)'}`, background:form.category===c.cat?`${c.color}15`:'var(--surface)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:'.4rem' }}>{c.icon}</div>
            <div style={{ fontSize:'.83rem', fontWeight:700, color:form.category===c.cat?c.color:'var(--text)' }}>{c.label}</div>
          </button>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'1rem' }}>
        {[['form','📝 Submit Ticket'],['faq','❓ FAQ']].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ padding:'.5rem 1.2rem', borderRadius:'8px', border:`1px solid ${activeTab===id?'rgba(56,189,248,.4)':'var(--border)'}`, background:activeTab===id?'rgba(56,189,248,.1)':'transparent', color:activeTab===id?'#38bdf8':'var(--muted)', fontFamily:'var(--font)', fontWeight:600, fontSize:'.88rem', cursor:'pointer', transition:'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── FORM TAB ── */}
      {activeTab === 'form' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', alignItems:'start' }}>
          {/* Form */}
          <div className="card" style={{ padding:'2rem' }}>
            {submitted ? (
              <div style={{ textAlign:'center', padding:'2rem 0' }}>
                <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>🎉</div>
                <h3 style={{ fontWeight:800, fontSize:'1.2rem', color:'var(--green)', marginBottom:'.5rem' }}>Query Submitted!</h3>
                <p style={{ color:'var(--muted)', fontSize:'.9rem', lineHeight:1.6, marginBottom:'1rem' }}>{submitted.message}</p>
                <div style={{ padding:'.75rem 1.25rem', background:'var(--green-dim)', border:'1px solid var(--green-border)', borderRadius:'10px', marginBottom:'1.5rem' }}>
                  <span style={{ color:'var(--green)', fontWeight:700 }}>🎫 Ticket ID: </span>
                  <span style={{ color:'var(--text)', fontWeight:800, fontSize:'1.05rem' }}>{submitted.data?.ticketId}</span>
                </div>
                <p style={{ color:'var(--dim)', fontSize:'.82rem' }}>Save your ticket ID for future reference. We'll reply to your email within 24 hours.</p>
                <button onClick={() => { setSubmitted(null); setForm({ name:user?.name||'', email:user?.email||'', category:'Other', subject:'', message:'' }); }}
                  className="btn-secondary" style={{ marginTop:'1.25rem' }}>
                  Submit Another Query
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontWeight:800, fontSize:'1.05rem', marginBottom:'1.5rem' }}>📝 Submit Support Ticket</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <div>
                      <label style={{ fontSize:'.78rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.35rem' }}>Full Name *</label>
                      <input name="name" value={form.name} onChange={change} placeholder="Your name"
                        style={{ width:'100%', padding:'.65rem .9rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'7px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.88rem', outline:'none', boxSizing:'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize:'.78rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.35rem' }}>Email *</label>
                      <input name="email" value={form.email} onChange={change} placeholder="your@email.com" type="email"
                        style={{ width:'100%', padding:'.65rem .9rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'7px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.88rem', outline:'none', boxSizing:'border-box' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize:'.78rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.35rem' }}>Category *</label>
                    <select name="category" value={form.category} onChange={change}
                      style={{ width:'100%', padding:'.65rem .9rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'7px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.88rem', outline:'none', boxSizing:'border-box' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize:'.78rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.35rem' }}>Subject *</label>
                    <input name="subject" value={form.subject} onChange={change} placeholder="Brief description of your issue"
                      style={{ width:'100%', padding:'.65rem .9rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'7px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.88rem', outline:'none', boxSizing:'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize:'.78rem', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'.35rem' }}>Message *</label>
                    <textarea name="message" value={form.message} onChange={change} placeholder="Describe your issue in detail..." rows={5}
                      style={{ width:'100%', padding:'.65rem .9rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'7px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.88rem', outline:'none', boxSizing:'border-box', resize:'vertical' }} />
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'.8rem' }}>
                    {loading ? '⏳ Submitting...' : '🚀 Submit Query'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Side Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Response time */}
            <div className="card" style={{ borderLeft:'3px solid var(--green)' }}>
              <h3 style={{ fontWeight:800, fontSize:'.95rem', marginBottom:'1rem' }}>⏱ Response Times</h3>
              {[
                { type:'Trading / Payment', time:'2–4 hours', color:'#4ade80' },
                { type:'Technical Issues',  time:'4–8 hours', color:'#38bdf8' },
                { type:'Account Queries',   time:'8–12 hours',color:'#a78bfa' },
                { type:'General Queries',   time:'24 hours',  color:'var(--muted)' },
              ].map(r => (
                <div key={r.type} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.4rem 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'.83rem', color:'var(--muted)' }}>{r.type}</span>
                  <span style={{ fontSize:'.83rem', fontWeight:700, color:r.color }}>{r.time}</span>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div className="card">
              <h3 style={{ fontWeight:800, fontSize:'.95rem', marginBottom:'1rem' }}>📞 Other Ways to Reach Us</h3>
              {[
                { icon:'📧', label:'Email', val:'support@gmail.com' },
                { icon:'📱', label:'WhatsApp', val:'+91 8236076680' },
                { icon:'🕐', label:'Support Hours', val:'Mon–Sat, 9AM–6PM' },
              ].map(c => (
                <div key={c.label} style={{ display:'flex', gap:'.75rem', padding:'.5rem 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'1.1rem' }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize:'.72rem', color:'var(--muted)', fontWeight:700 }}>{c.label}</div>
                    <div style={{ fontSize:'.85rem', color:'var(--text)', fontWeight:600 }}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FAQ TAB ── */}
      {activeTab === 'faq' && (
        <div style={{ maxWidth:'780px' }}>
          <h2 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'1.5rem' }}>❓ Frequently Asked Questions</h2>
          {FAQ.map((faq, i) => (
            <div key={i} style={{ marginBottom:'.75rem', background:'var(--surface)', border:`1px solid ${openFaq===i?'var(--green-border)':'var(--border)'}`, borderRadius:'10px', overflow:'hidden', transition:'all .15s' }}>
              <button onClick={() => setOpenFaq(openFaq===i ? null : i)}
                style={{ width:'100%', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:'transparent', border:'none', color:'var(--text)', fontFamily:'var(--font)', fontWeight:700, fontSize:'.9rem', cursor:'pointer', textAlign:'left', gap:'.75rem' }}>
                <span>{faq.q}</span>
                <span style={{ color:'var(--green)', fontSize:'1.1rem', transition:'transform .2s', transform:openFaq===i?'rotate(45deg)':'none', flexShrink:0 }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding:'0 1.25rem 1rem', borderTop:'1px solid var(--border)' }}>
                  <p style={{ color:'var(--muted)', fontSize:'.87rem', lineHeight:1.65, paddingTop:'.75rem' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop:'2rem', padding:'1.5rem', background:'linear-gradient(135deg,rgba(74,222,128,.07),rgba(56,189,248,.05))', border:'1px solid var(--green-border)', borderRadius:'12px', textAlign:'center' }}>
            <p style={{ color:'var(--muted)', fontSize:'.9rem', marginBottom:'1rem' }}>Didn't find your answer? Submit a ticket and we'll help you.</p>
            <button onClick={() => setActiveTab('form')} className="btn-primary">
              📝 Submit a Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
