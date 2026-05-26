import { useNavigate } from 'react-router-dom';

const TYPE_ICON = { Solar:'☀️', Wind:'🌬️', Biogas:'🌿' };

export default function ProducerCard({ producer }) {
  const navigate = useNavigate();
  const cls = `badge-${producer.type.toLowerCase()}`;

  return (
    <div className="card" style={{ cursor:'pointer', display:'flex', flexDirection:'column', gap:'.75rem' }}
      onClick={() => navigate('/trading', { state: { producer } })}>
      
      {/* Top Row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className={cls} style={{ padding:'.25rem .75rem', borderRadius:'20px', fontSize:'.78rem', fontWeight:700 }}>
          {TYPE_ICON[producer.type]} {producer.type}
        </span>
        {producer.verified && (
          <span style={{ fontSize:'.72rem', color:'var(--green)', background:'var(--green-dim)', border:'1px solid var(--green-border)', padding:'.2rem .6rem', borderRadius:'20px' }}>
            ✓ Verified
          </span>
        )}
      </div>

      {/* Name & Location */}
      <div>
        <h3 style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text)' }}>{producer.name}</h3>
        <p style={{ fontSize:'.82rem', color:'var(--dim)', marginTop:'.2rem' }}>📍 {producer.location}</p>
      </div>

      <p style={{ fontSize:'.82rem', color:'var(--muted)', lineHeight:1.5 }}>{producer.description}</p>

      {/* Stats Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.4rem' }}>
        {[
          { label:'Capacity', val:`${producer.capacity} ${producer.capacityUnit}`, color:'var(--text)' },
          { label:'Available', val:`${producer.available} kW`, color:'var(--green)' },
          { label:'Price', val:`₹${producer.price}/kWh`, color:'var(--yellow)' },
        ].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'.5rem', textAlign:'center' }}>
            <div style={{ fontSize:'.85rem', fontWeight:700, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:'.68rem', color:'var(--dim)', marginTop:'.15rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
        <span style={{ color:'var(--yellow)', fontSize:'.82rem' }}>
          {'★'.repeat(Math.floor(producer.rating))}{'☆'.repeat(5-Math.floor(producer.rating))} {producer.rating}
        </span>
        <button className="btn-secondary" style={{ padding:'.3rem .9rem', fontSize:'.82rem' }}
          onClick={e => { e.stopPropagation(); navigate('/trading', { state: { producer } }); }}>
          Trade →
        </button>
      </div>
    </div>
  );
}
