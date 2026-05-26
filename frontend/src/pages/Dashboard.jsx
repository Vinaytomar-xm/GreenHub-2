import { useEffect, useState } from 'react';
import { getStats, getTrades, getProducers } from '../api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MOCK_MONTHLY = [42,65,55,80,70,90,85,78,95,88,72,98];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [producers, setProducers] = useState([]);

  useEffect(() => {
    getStats().then(r => setStats(r.data.data)).catch(()=>{});
    getTrades(undefined, 5).then(r => setTrades(r.data.data)).catch(()=>{});
    getProducers().then(r => setProducers(r.data.data)).catch(()=>{});
    const iv = setInterval(() => getStats().then(r => setStats(r.data.data)).catch(()=>{}), 6000);
    return () => clearInterval(iv);
  }, []);

  const maxBar = Math.max(...MOCK_MONTHLY);

  return (
    <div className="fade-in">
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontSize:'2rem', fontWeight:900, letterSpacing:'-1px', marginBottom:'.5rem' }}>📊 Dashboard</h1>
        <p style={{ color:'var(--muted)' }}>Live platform analytics and your trading portfolio</p>
      </div>

      {/* Top KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
        {[
          { icon:'⚡', label:'Energy Traded Today', val:stats?`${(stats.energyTradedToday/1000).toFixed(1)} MWh`:'—', color:'var(--green)' },
          { icon:'🌿', label:'CO₂ Saved Today',    val:stats?`${(stats.co2SavedToday/1000).toFixed(1)} tons`:'—', color:'var(--green)' },
          { icon:'🔄', label:'Total Trades',        val:stats?stats.totalTrades:'—', color:'var(--blue)' },
          { icon:'🏭', label:'Active Producers',    val:stats?stats.totalProducers.toLocaleString():'—', color:'var(--yellow)' },
          { icon:'🏠', label:'Consumers',           val:stats?stats.totalConsumers.toLocaleString():'—', color:'var(--yellow)' },
          { icon:'📋', label:'Pending Trades',      val:stats?stats.activeTrades:'—', color:'#f97316' },
        ].map(k => (
          <div key={k.label} className="card">
            <div style={{ fontSize:'1.5rem', marginBottom:'.5rem' }}>{k.icon}</div>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:'.75rem', color:'var(--muted)', marginTop:'.2rem' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>

        {/* Monthly Chart */}
        <div className="card">
          <h3 style={{ fontSize:'.9rem', fontWeight:700, color:'var(--muted)', marginBottom:'1.5rem', textTransform:'uppercase', letterSpacing:'.5px' }}>
            Monthly Energy Traded (MWh)
          </h3>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'.4rem', height:'160px' }}>
            {MOCK_MONTHLY.map((v,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%', justifyContent:'flex-end', gap:'.3rem' }}>
                <div style={{ width:'100%', height:`${(v/maxBar)*100}%`, background:'linear-gradient(to top,#059669,#4ade80)', borderRadius:'4px 4px 0 0', minHeight:'4px', transition:'height .5s ease' }} />
                <span style={{ fontSize:'.6rem', color:'var(--dim)' }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="card">
          <h3 style={{ fontSize:'.9rem', fontWeight:700, color:'var(--muted)', marginBottom:'1.5rem', textTransform:'uppercase', letterSpacing:'.5px' }}>
            Environmental Impact
          </h3>
          {[
            { icon:'🌳', label:'Trees Equivalent', val:'1,240 trees' },
            { icon:'🚗', label:'Cars Off Road',    val:'89 days'   },
            { icon:'🏠', label:'Homes Powered',    val:'340 homes' },
            { icon:'💧', label:'Water Saved',      val:'18,500 L'  },
          ].map(e => (
            <div key={e.label} style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.75rem 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:'1.5rem' }}>{e.icon}</span>
              <div>
                <div style={{ fontSize:'.85rem', color:'var(--muted)' }}>{e.label}</div>
                <div style={{ fontWeight:700, color:'var(--green)' }}>{e.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>

        {/* Recent Trades */}
        <div className="card">
          <h3 style={{ fontSize:'.9rem', fontWeight:700, color:'var(--muted)', marginBottom:'1.25rem', textTransform:'uppercase', letterSpacing:'.5px' }}>Recent Trades</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
            {trades.map(t => (
              <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.6rem 0', borderBottom:'1px solid var(--border)', fontSize:'.82rem' }}>
                <div>
                  <div style={{ color:'var(--text)', fontWeight:600 }}>{t.producerName} → {t.consumer}</div>
                  <div style={{ color:'var(--dim)', marginTop:'.1rem' }}>{t.amount} kWh · {new Date(t.timestamp).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'var(--yellow)', fontWeight:700 }}>₹{t.totalValue}</div>
                  <div style={{ color: t.status==='completed'?'var(--green)':'#f97316', fontSize:'.72rem', marginTop:'.1rem' }}>{t.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Producers */}
        <div className="card">
          <h3 style={{ fontSize:'.9rem', fontWeight:700, color:'var(--muted)', marginBottom:'1.25rem', textTransform:'uppercase', letterSpacing:'.5px' }}>Top Producers by Rating</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
            {[...producers].sort((a,b)=>b.rating-a.rating).slice(0,5).map((p,i) => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.5rem 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'.75rem', fontWeight:800, color:'var(--dim)', width:'16px' }}>#{i+1}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'.88rem', fontWeight:600, color:'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--dim)' }}>{p.type} · {p.location}</div>
                </div>
                <div style={{ color:'var(--yellow)', fontSize:'.85rem', fontWeight:700 }}>★ {p.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
