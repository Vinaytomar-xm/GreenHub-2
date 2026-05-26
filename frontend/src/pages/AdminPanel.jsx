import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  adminGetProducers, adminUpdateProducer,
  adminGetUsers, adminGetBuyRequests, adminUpdateBuyReq,
  adminGetConnections, getSupport, updateSupport
} from '../api';
import { useNotification } from '../context/NotificationContext';

const TAB_LIST = [
  { id: 'producers',    label: '⚡ Producers',    badge: 'pending' },
  { id: 'buy-requests', label: '🛒 Buy Requests',  badge: null },
  { id: 'connections',  label: '🤝 Connections',   badge: null },
  { id: 'support',      label: '💬 Support',       badge: 'open'   },
  { id: 'users',        label: '👥 Users',         badge: null },
];

const STATUS_COLORS = {
  pending:    { bg:'rgba(251,191,36,.15)',  color:'#fbbf24', border:'rgba(251,191,36,.4)'  },
  approved:   { bg:'rgba(74,222,128,.12)',  color:'#4ade80', border:'rgba(74,222,128,.35)' },
  rejected:   { bg:'rgba(239,68,68,.12)',   color:'#f87171', border:'rgba(239,68,68,.35)'  },
  accepted:   { bg:'rgba(74,222,128,.12)',  color:'#4ade80', border:'rgba(74,222,128,.35)' },
  open:       { bg:'rgba(251,191,36,.15)',  color:'#fbbf24', border:'rgba(251,191,36,.4)'  },
  'in-progress':{ bg:'rgba(56,189,248,.12)',color:'#38bdf8', border:'rgba(56,189,248,.35)' },
  resolved:   { bg:'rgba(74,222,128,.12)',  color:'#4ade80', border:'rgba(74,222,128,.35)' },
  contacted:  { bg:'rgba(56,189,248,.12)',  color:'#38bdf8', border:'rgba(56,189,248,.35)' },
  completed:  { bg:'rgba(74,222,128,.12)',  color:'#4ade80', border:'rgba(74,222,128,.35)' },
  consumer:   { bg:'rgba(56,189,248,.12)',  color:'#38bdf8', border:'rgba(56,189,248,.35)' },
  producer:   { bg:'rgba(251,191,36,.12)',  color:'#fbbf24', border:'rgba(251,191,36,.35)' },
  investor:   { bg:'rgba(74,222,128,.12)',  color:'#4ade80', border:'rgba(74,222,128,.35)' },
  admin:      { bg:'rgba(167,139,250,.12)', color:'#a78bfa', border:'rgba(167,139,250,.35)'},
  user:       { bg:'rgba(148,163,184,.1)',  color:'#94a3b8', border:'rgba(148,163,184,.25)'},
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.user;
  return (
    <span style={{ padding:'.2rem .7rem', borderRadius:'20px', fontSize:'.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background:'var(--surface)', border:`1px solid ${color}30`, borderRadius:'12px', padding:'1.25rem', flex:'1', minWidth:'130px' }}>
      <div style={{ fontSize:'1.4rem', marginBottom:'.4rem' }}>{icon}</div>
      <div style={{ fontSize:'1.6rem', fontWeight:900, color }}>{value}</div>
      <div style={{ fontSize:'.75rem', color:'var(--muted)', marginTop:'.2rem' }}>{label}</div>
    </div>
  );
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [tab, setTab]             = useState('producers');
  const [producers, setProducers] = useState([]);
  const [users, setUsers]         = useState([]);
  const [buyReqs, setBuyReqs]     = useState([]);
  const [connections, setConn]    = useState([]);
  const [support, setSupport]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [noteModal, setNoteModal] = useState(null); // { id, type }
  const [noteText, setNoteText]   = useState('');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, u, br, c, s] = await Promise.all([
        adminGetProducers(), adminGetUsers(), adminGetBuyRequests(),
        adminGetConnections(), getSupport()
      ]);
      setProducers(p.data.data);
      setUsers(u.data.data);
      setBuyReqs(br.data.data);
      setConn(c.data.data);
      setSupport(s.data.data);
    } catch { notify('Failed to load admin data', 'error'); }
    finally { setLoading(false); }
  }

  async function handleProducerAction(id, status) {
    try {
      const note = noteText;
      const res = await adminUpdateProducer(id, { status, adminNote: note });
      setProducers(prev => prev.map(p => p._id === id ? res.data.data : p));
      notify(`Producer ${status} successfully! ✅`);
      setNoteModal(null); setNoteText('');
    } catch (err) { notify(err.response?.data?.message || 'Action failed', 'error'); }
  }

  async function handleBuyReqAction(id, status) {
    try {
      const res = await adminUpdateBuyReq(id, { status });
      setBuyReqs(prev => prev.map(b => b._id === id ? res.data.data : b));
      notify(`Buy request ${status}!`);
    } catch { notify('Action failed', 'error'); }
  }

  async function handleSupportAction(id, status, reply) {
    try {
      const res = await updateSupport(id, { status, adminReply: reply || '' });
      setSupport(prev => prev.map(s => s._id === id ? res.data.data : s));
      notify(`Ticket updated!`);
      setNoteModal(null); setNoteText('');
    } catch { notify('Action failed', 'error'); }
  }

  const pendingProducers = producers.filter(p => p.status === 'pending').length;
  const openTickets      = support.filter(s => s.status === 'open').length;

  const filterData = (arr, keys) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter(item => keys.some(k => String(item[k]||'').toLowerCase().includes(q)));
  };

  if (!isAdmin) return null;

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div style={{ marginBottom:'2rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.35rem 1rem', background:'rgba(167,139,250,.12)', border:'1px solid rgba(167,139,250,.3)', borderRadius:'20px', color:'#a78bfa', fontSize:'.78rem', fontWeight:700, marginBottom:'1rem' }}>
          🛡️ ADMIN PANEL
        </div>
        <h1 style={{ fontSize:'2rem', fontWeight:900, letterSpacing:'-1px', marginBottom:'.4rem' }}>
          Greenity <span style={{ color:'#a78bfa' }}>Admin</span>
        </h1>
        <p style={{ color:'var(--muted)', fontSize:'.9rem' }}>Manage producers, requests, connections and support — all in one place.</p>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'2rem' }}>
        <StatCard icon="⚡" label="Total Producers" value={producers.length}                 color="#fbbf24" />
        <StatCard icon="⏳" label="Pending Approval" value={pendingProducers}                 color="#f97316" />
        <StatCard icon="👥" label="Total Users"       value={users.length}                    color="#38bdf8" />
        <StatCard icon="🛒" label="Buy Requests"      value={buyReqs.length}                  color="#4ade80" />
        <StatCard icon="🤝" label="Connections"       value={connections.length}              color="#a78bfa" />
        <StatCard icon="🎫" label="Open Tickets"      value={openTickets}                     color="#f87171" />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'1rem' }}>
        {TAB_LIST.map(t => {
          const count = t.badge === 'pending' ? pendingProducers : t.badge === 'open' ? openTickets : 0;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }}
              style={{ padding:'.5rem 1.1rem', borderRadius:'8px', border:`1px solid ${tab===t.id?'rgba(167,139,250,.5)':'var(--border)'}`, background:tab===t.id?'rgba(167,139,250,.12)':'transparent', color:tab===t.id?'#a78bfa':'var(--muted)', fontFamily:'var(--font)', fontWeight:600, fontSize:'.85rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'.4rem', transition:'all .15s' }}>
              {t.label}
              {count > 0 && <span style={{ background:'#ef4444', color:'#fff', borderRadius:'10px', padding:'0 6px', fontSize:'.65rem', fontWeight:800 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom:'1.25rem' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search..."
          style={{ padding:'.6rem 1rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.88rem', width:'280px', outline:'none' }}
        />
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <>
          {/* ══ PRODUCERS TAB ══════════════════════════════════════════ */}
          {tab === 'producers' && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'1rem', color:'#fbbf24' }}>⚡ Producer Registrations</h2>
              {filterData(producers, ['name','type','location','ownerName','email','status']).length === 0
                ? <p style={{ color:'var(--muted)' }}>No producers found.</p>
                : filterData(producers, ['name','type','location','ownerName','email','status']).map(p => (
                <div key={p._id} className="card" style={{ marginBottom:'1rem', borderLeft:`3px solid ${p.status==='approved'?'#4ade80':p.status==='rejected'?'#f87171':'#fbbf24'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.5rem', flexWrap:'wrap' }}>
                        <h3 style={{ fontWeight:800, fontSize:'1rem' }}>{p.name}</h3>
                        <StatusBadge status={p.status} />
                        {p.verified && <span style={{ padding:'.15rem .55rem', background:'rgba(74,222,128,.1)', color:'#4ade80', border:'1px solid rgba(74,222,128,.3)', borderRadius:'4px', fontSize:'.65rem', fontWeight:700 }}>✓ VERIFIED</span>}
                        <span style={{ padding:'.15rem .55rem', background:'rgba(56,189,248,.1)', color:'#38bdf8', border:'1px solid rgba(56,189,248,.3)', borderRadius:'4px', fontSize:'.65rem', fontWeight:700 }}>{p.type}</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'.35rem' }}>
                        {[
                          ['📍 Location', p.location],
                          ['⚡ Capacity', `${p.capacity} ${p.capacityUnit}`],
                          ['💰 Price', `₹${p.price}/kWh`],
                          ['👤 Owner', p.ownerName],
                          ['📧 Email', p.email],
                          ['📞 Phone', p.phone],
                          ['📊 Rating', `${p.rating} ⭐`],
                          ['📅 Submitted', new Date(p.createdAt).toLocaleDateString('en-IN')],
                        ].map(([k,v]) => v ? (
                          <div key={k} style={{ fontSize:'.82rem' }}>
                            <span style={{ color:'var(--muted)' }}>{k}: </span>
                            <span style={{ color:'var(--text)', fontWeight:600 }}>{v}</span>
                          </div>
                        ) : null)}
                      </div>
                      {p.description && <p style={{ fontSize:'.83rem', color:'var(--muted)', marginTop:'.5rem', fontStyle:'italic' }}>"{p.description}"</p>}
                      {p.adminNote && <p style={{ fontSize:'.8rem', color:'#f97316', marginTop:'.4rem' }}>📋 Note: {p.adminNote}</p>}
                    </div>

                    {/* Action buttons */}
                    {p.status === 'pending' && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'.5rem', minWidth:'140px' }}>
                        <button onClick={() => { setNoteModal({ id:p._id, type:'approve' }); setNoteText(''); }}
                          style={{ padding:'.5rem 1rem', borderRadius:'7px', border:'1px solid rgba(74,222,128,.4)', background:'rgba(74,222,128,.1)', color:'#4ade80', fontFamily:'var(--font)', fontWeight:700, fontSize:'.83rem', cursor:'pointer' }}>
                          ✅ Approve
                        </button>
                        <button onClick={() => { setNoteModal({ id:p._id, type:'reject' }); setNoteText(''); }}
                          style={{ padding:'.5rem 1rem', borderRadius:'7px', border:'1px solid rgba(239,68,68,.4)', background:'rgba(239,68,68,.1)', color:'#f87171', fontFamily:'var(--font)', fontWeight:700, fontSize:'.83rem', cursor:'pointer' }}>
                          ❌ Reject
                        </button>
                      </div>
                    )}
                    {p.status !== 'pending' && (
                      <button onClick={() => { setNoteModal({ id:p._id, type:'pending' }); setNoteText(''); }}
                        style={{ padding:'.5rem 1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--muted)', fontFamily:'var(--font)', fontWeight:700, fontSize:'.83rem', cursor:'pointer' }}>
                        ↩ Reset
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ BUY REQUESTS TAB ═══════════════════════════════════════ */}
          {tab === 'buy-requests' && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'1rem', color:'#4ade80' }}>🛒 Buy Requests</h2>
              {filterData(buyReqs, ['buyerName','buyerEmail','buyerCity','producerName','status']).length === 0
                ? <p style={{ color:'var(--muted)' }}>No buy requests yet.</p>
                : filterData(buyReqs, ['buyerName','buyerEmail','buyerCity','producerName','status']).map(b => (
                <div key={b._id} className="card" style={{ marginBottom:'1rem', borderLeft:`3px solid ${b.status==='accepted'?'#4ade80':b.status==='rejected'?'#f87171':'#fbbf24'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.5rem', flexWrap:'wrap' }}>
                        <h3 style={{ fontWeight:800 }}>{b.buyerName}</h3>
                        <StatusBadge status={b.status} />
                        <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>#{b.reqId}</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'.35rem', fontSize:'.82rem' }}>
                        {[
                          ['📧 Email', b.buyerEmail], ['📍 City', b.buyerCity],
                          ['🏭 Producer', b.producerName], ['⚡ Type', b.energyType],
                          ['📊 Amount', `${b.amount} kWh`], ['💰 Estimate', `₹${b.totalEstimate}`],
                          ['⏱ Duration', b.duration], ['🏠 Buyer Type', b.buyerType],
                          ['📅 Date', new Date(b.createdAt).toLocaleDateString('en-IN')],
                        ].map(([k,v]) => v ? (
                          <div key={k}><span style={{ color:'var(--muted)' }}>{k}: </span><span style={{ fontWeight:600 }}>{v}</span></div>
                        ) : null)}
                      </div>
                      {b.message && <p style={{ fontSize:'.8rem', color:'var(--muted)', marginTop:'.4rem', fontStyle:'italic' }}>"{b.message}"</p>}
                    </div>
                    {b.status === 'pending' && (
                      <div style={{ display:'flex', gap:'.5rem' }}>
                        <button onClick={() => handleBuyReqAction(b._id, 'accepted')}
                          style={{ padding:'.45rem .9rem', borderRadius:'7px', border:'1px solid rgba(74,222,128,.4)', background:'rgba(74,222,128,.1)', color:'#4ade80', fontFamily:'var(--font)', fontWeight:700, fontSize:'.8rem', cursor:'pointer' }}>
                          ✅ Accept
                        </button>
                        <button onClick={() => handleBuyReqAction(b._id, 'rejected')}
                          style={{ padding:'.45rem .9rem', borderRadius:'7px', border:'1px solid rgba(239,68,68,.4)', background:'rgba(239,68,68,.1)', color:'#f87171', fontFamily:'var(--font)', fontWeight:700, fontSize:'.8rem', cursor:'pointer' }}>
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ CONNECTIONS TAB ════════════════════════════════════════ */}
          {tab === 'connections' && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'1rem', color:'#a78bfa' }}>🤝 Connection Requests</h2>
              {filterData(connections, ['name','email','role','city','company','status']).length === 0
                ? <p style={{ color:'var(--muted)' }}>No connections yet.</p>
                : filterData(connections, ['name','email','role','city','company','status']).map(c => (
                <div key={c._id} className="card" style={{ marginBottom:'.75rem', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', alignItems:'center' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.35rem', flexWrap:'wrap' }}>
                      <h3 style={{ fontWeight:800, fontSize:'.95rem' }}>{c.name}</h3>
                      <StatusBadge status={c.role} />
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', fontSize:'.82rem' }}>
                      {[['📧',c.email],['📞',c.phone],['📍',c.city],['🏢',c.company]].map(([icon,val]) => val ? (
                        <span key={icon} style={{ color:'var(--muted)' }}>{icon} <span style={{ color:'var(--text)' }}>{val}</span></span>
                      ) : null)}
                      <span style={{ color:'var(--dim)' }}>📅 {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    {c.message && <p style={{ fontSize:'.8rem', color:'var(--muted)', marginTop:'.3rem', fontStyle:'italic' }}>"{c.message}"</p>}
                  </div>
                  <span style={{ fontSize:'.75rem', color:'var(--dim)' }}>#{c.connId}</span>
                </div>
              ))}
            </div>
          )}

          {/* ══ SUPPORT TAB ════════════════════════════════════════════ */}
          {tab === 'support' && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'1rem', color:'#f87171' }}>💬 Support Tickets</h2>
              {filterData(support, ['name','email','subject','category','status','ticketId']).length === 0
                ? <p style={{ color:'var(--muted)' }}>No support queries yet.</p>
                : filterData(support, ['name','email','subject','category','status','ticketId']).map(s => (
                <div key={s._id} className="card" style={{ marginBottom:'1rem', borderLeft:`3px solid ${s.status==='resolved'?'#4ade80':s.status==='in-progress'?'#38bdf8':'#f87171'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.5rem', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'.72rem', color:'var(--dim)', fontWeight:700 }}>🎫 {s.ticketId}</span>
                        <StatusBadge status={s.status} />
                        <span style={{ padding:'.15rem .55rem', background:'rgba(56,189,248,.1)', color:'#38bdf8', border:'1px solid rgba(56,189,248,.3)', borderRadius:'4px', fontSize:'.65rem', fontWeight:700 }}>{s.category}</span>
                      </div>
                      <h3 style={{ fontWeight:800, fontSize:'.95rem', marginBottom:'.35rem' }}>{s.subject}</h3>
                      <p style={{ fontSize:'.83rem', color:'var(--muted)', lineHeight:1.55, marginBottom:'.5rem' }}>{s.message}</p>
                      <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', fontSize:'.8rem' }}>
                        <span><span style={{ color:'var(--muted)' }}>👤 </span>{s.name}</span>
                        <span><span style={{ color:'var(--muted)' }}>📧 </span>{s.email}</span>
                        <span style={{ color:'var(--dim)' }}>📅 {new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      {s.adminReply && (
                        <div style={{ marginTop:'.6rem', padding:'.6rem .9rem', background:'rgba(74,222,128,.07)', border:'1px solid rgba(74,222,128,.2)', borderRadius:'7px' }}>
                          <span style={{ fontSize:'.75rem', color:'var(--green)', fontWeight:700 }}>📝 Admin Reply: </span>
                          <span style={{ fontSize:'.82rem', color:'var(--text)' }}>{s.adminReply}</span>
                        </div>
                      )}
                    </div>
                    {s.status !== 'resolved' && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'.4rem', minWidth:'130px' }}>
                        <button onClick={() => { setNoteModal({ id:s._id, type:'support' }); setNoteText(s.adminReply||''); }}
                          style={{ padding:'.45rem .85rem', borderRadius:'7px', border:'1px solid rgba(56,189,248,.4)', background:'rgba(56,189,248,.1)', color:'#38bdf8', fontFamily:'var(--font)', fontWeight:700, fontSize:'.8rem', cursor:'pointer' }}>
                          💬 Reply
                        </button>
                        {s.status !== 'in-progress' && (
                          <button onClick={() => handleSupportAction(s._id, 'in-progress', s.adminReply)}
                            style={{ padding:'.45rem .85rem', borderRadius:'7px', border:'1px solid rgba(251,191,36,.4)', background:'rgba(251,191,36,.1)', color:'#fbbf24', fontFamily:'var(--font)', fontWeight:700, fontSize:'.8rem', cursor:'pointer' }}>
                            🔄 In Progress
                          </button>
                        )}
                        <button onClick={() => handleSupportAction(s._id, 'resolved', s.adminReply)}
                          style={{ padding:'.45rem .85rem', borderRadius:'7px', border:'1px solid rgba(74,222,128,.4)', background:'rgba(74,222,128,.1)', color:'#4ade80', fontFamily:'var(--font)', fontWeight:700, fontSize:'.8rem', cursor:'pointer' }}>
                          ✅ Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ USERS TAB ══════════════════════════════════════════════ */}
          {tab === 'users' && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'1rem', color:'#38bdf8' }}>👥 Registered Users</h2>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.83rem' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['Name','Email','Role','Type','City','Phone','Joined'].map(h => (
                        <th key={h} style={{ padding:'.65rem .75rem', textAlign:'left', color:'var(--muted)', fontWeight:700, fontSize:'.75rem', letterSpacing:'.5px', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterData(users, ['name','email','role','userType','city']).map((u, i) => (
                      <tr key={u._id} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'transparent':'rgba(255,255,255,.01)' }}>
                        <td style={{ padding:'.6rem .75rem', fontWeight:700 }}>{u.name}</td>
                        <td style={{ padding:'.6rem .75rem', color:'var(--muted)' }}>{u.email}</td>
                        <td style={{ padding:'.6rem .75px' }}><StatusBadge status={u.role} /></td>
                        <td style={{ padding:'.6rem .75px' }}><StatusBadge status={u.userType} /></td>
                        <td style={{ padding:'.6rem .75rem', color:'var(--muted)' }}>{u.city || '—'}</td>
                        <td style={{ padding:'.6rem .75rem', color:'var(--muted)' }}>{u.phone || '—'}</td>
                        <td style={{ padding:'.6rem .75rem', color:'var(--dim)', whiteSpace:'nowrap' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ NOTE MODAL ══════════════════════════════════════════════════ */}
      {noteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'16px', padding:'2rem', width:'100%', maxWidth:'460px' }}>
            <h3 style={{ fontWeight:800, marginBottom:'1rem', fontSize:'1.05rem' }}>
              {noteModal.type === 'support' ? '💬 Reply to Ticket' : `${noteModal.type === 'approve' ? '✅ Approve' : noteModal.type === 'reject' ? '❌ Reject' : '↩ Reset'} Producer`}
            </h3>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder={noteModal.type === 'support' ? 'Type your reply to the user...' : 'Add an admin note (optional)...'}
              rows={4}
              style={{ width:'100%', padding:'.75rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'.88rem', resize:'vertical', outline:'none', boxSizing:'border-box' }}
            />
            <div style={{ display:'flex', gap:'.75rem', marginTop:'1rem', justifyContent:'flex-end' }}>
              <button onClick={() => { setNoteModal(null); setNoteText(''); }}
                style={{ padding:'.5rem 1.1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'transparent', color:'var(--muted)', fontFamily:'var(--font)', fontWeight:600, cursor:'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (noteModal.type === 'support') handleSupportAction(noteModal.id, 'in-progress', noteText);
                  else handleProducerAction(noteModal.id, noteModal.type === 'approve' ? 'approved' : noteModal.type === 'reject' ? 'rejected' : 'pending');
                }}
                style={{ padding:'.5rem 1.3rem', borderRadius:'7px', border:'none', background: noteModal.type==='reject'?'rgba(239,68,68,.8)':noteModal.type==='support'?'rgba(56,189,248,.8)':'rgba(74,222,128,.8)', color:'#fff', fontFamily:'var(--font)', fontWeight:700, cursor:'pointer' }}>
                {noteModal.type === 'support' ? 'Send Reply' : noteModal.type === 'approve' ? 'Confirm Approve' : noteModal.type === 'reject' ? 'Confirm Reject' : 'Reset Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
