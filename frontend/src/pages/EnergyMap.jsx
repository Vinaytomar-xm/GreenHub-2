import { useEffect, useState, useCallback } from 'react';
import { getEnergyMap } from '../api';

/* ── India SVG city positions (normalized 0-100 for the viewBox) ── */
const CITY_POSITIONS = {
  'Jaipur':     { x: 31, y: 28 },
  'Jodhpur':    { x: 23, y: 31 },
  'Ahmedabad':  { x: 22, y: 41 },
  'Surat':      { x: 23, y: 49 },
  'Mumbai':     { x: 20, y: 55 },
  'Pune':       { x: 23, y: 57 },
  'Delhi':      { x: 36, y: 20 },
  'Lucknow':    { x: 46, y: 25 },
  'Amritsar':   { x: 31, y: 14 },
  'Chennai':    { x: 44, y: 75 },
  'Coimbatore': { x: 37, y: 78 },
  'Bangalore':  { x: 38, y: 72 },
  'Hyderabad':  { x: 41, y: 62 },
  'Bhopal':     { x: 37, y: 40 },
  'Kolkata':    { x: 65, y: 42 },
};

/* India outline paths (simplified SVG) */
const INDIA_PATH = `M 31 8 L 35 7 L 40 8 L 46 7 L 52 10 L 58 12 L 64 15 L 70 18
  L 74 22 L 76 28 L 78 35 L 75 40 L 72 44 L 70 50 L 65 55 L 60 62
  L 55 68 L 50 72 L 47 78 L 44 82 L 40 86 L 37 84 L 34 80 L 30 76
  L 26 70 L 22 64 L 18 58 L 16 52 L 14 46 L 15 40 L 17 34 L 19 28
  L 22 22 L 26 17 L 28 12 Z`;

function getZoneColor(status) {
  if (status === 'surplus')  return { fill: 'rgba(74,222,128,0.75)',  stroke: '#4ade80', glow: '#4ade80' };
  if (status === 'deficit')  return { fill: 'rgba(239,68,68,0.75)',   stroke: '#f87171', glow: '#f87171' };
  return                            { fill: 'rgba(251,191,36,0.75)',  stroke: '#fbbf24', glow: '#fbbf24' };
}

function PulseCircle({ cx, cy, color, r = 6 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 4} fill={color.fill} opacity="0.25">
        <animate attributeName="r" values={`${r+2};${r+8};${r+2}`} dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={r} fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
    </g>
  );
}

export default function EnergyMap() {
  const [zones, setZones]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter]     = useState('all'); // 'all' | 'surplus' | 'deficit' | 'balanced'

  const fetchMap = useCallback(async () => {
    try {
      const res = await getEnergyMap();
      setZones(res.data.data);
      setLastUpdate(new Date());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchMap();
    const iv = setInterval(fetchMap, 10000);
    return () => clearInterval(iv);
  }, [fetchMap]);

  const filtered = filter === 'all' ? zones : zones.filter(z => z.status === filter);

  const counts = {
    surplus:  zones.filter(z => z.status === 'surplus').length,
    deficit:  zones.filter(z => z.status === 'deficit').length,
    balanced: zones.filter(z => z.status === 'balanced').length,
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.35rem 1rem', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '20px', color: 'var(--green)', fontSize: '.78rem', fontWeight: 700, marginBottom: '1rem' }}>
          🗺️ LIVE ENERGY MAP
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '.4rem' }}>
              India <span style={{ color: 'var(--green)' }}>Energy</span> Grid
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
              Real-time renewable energy generation vs demand across major Indian cities
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', color: 'var(--muted)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            LIVE · Auto-refresh every 10s
            {lastUpdate && <span style={{ color: 'var(--dim)' }}>· Updated {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
          </div>
        </div>
      </div>

      {/* Legend + Filter */}
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', marginRight: '.25rem' }}>FILTER:</span>
        {[
          { id: 'all',      label: `All Cities (${zones.length})`, color: 'var(--muted)',  bg: 'var(--surface)' },
          { id: 'surplus',  label: `🟢 Surplus (${counts.surplus})`, color: '#4ade80', bg: 'rgba(74,222,128,.12)' },
          { id: 'deficit',  label: `🔴 Deficit (${counts.deficit})`, color: '#f87171', bg: 'rgba(239,68,68,.12)'  },
          { id: 'balanced', label: `🟡 Balanced (${counts.balanced})`, color: '#fbbf24', bg: 'rgba(251,191,36,.12)'},
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding: '.4rem 1rem', borderRadius: '20px', border: `1px solid ${filter===f.id?f.color+'80':'var(--border)'}`, background: filter===f.id?f.bg:'transparent', color: filter===f.id?f.color:'var(--muted)', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '.8rem', cursor: 'pointer', transition: 'all .15s' }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Map SVG ── */}
        <div style={{ background: 'linear-gradient(135deg,rgba(5,15,26,0.9),rgba(10,22,40,0.95))', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(74,222,128,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', borderRadius: '16px' }} />

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
              <div className="loading-spinner" />
            </div>
          ) : (
            <svg viewBox="0 0 88 95" style={{ width: '100%', height: '500px' }} xmlns="http://www.w3.org/2000/svg">
              {/* India outline */}
              <path d={INDIA_PATH} fill="rgba(74,222,128,0.04)" stroke="rgba(74,222,128,0.2)" strokeWidth="0.5" strokeLinejoin="round" />

              {/* Grid overlay */}
              {[20,30,40,50,60,70].map(x => (
                <line key={`vx${x}`} x1={x} y1="0" x2={x} y2="95" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
              ))}
              {[10,20,30,40,50,60,70,80].map(y => (
                <line key={`hy${y}`} x1="0" y1={y} x2="88" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
              ))}

              {/* City zones */}
              {zones.filter(z => CITY_POSITIONS[z.city]).map(zone => {
                const pos   = CITY_POSITIONS[zone.city];
                const color = getZoneColor(zone.status);
                const isSelected = selected?.city === zone.city;
                const isFiltered = filter !== 'all' && zone.status !== filter;

                return (
                  <g key={zone.id} style={{ cursor: 'pointer', opacity: isFiltered ? 0.25 : 1, transition: 'opacity .2s' }}
                    onClick={() => setSelected(zone === selected ? null : zone)}>

                    {/* Glow ring for selected */}
                    {isSelected && (
                      <circle cx={pos.x} cy={pos.y} r="10" fill="none" stroke={color.glow} strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="r" values="8;13;8" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <PulseCircle cx={pos.x} cy={pos.y} color={color} r={isSelected ? 8 : 6} />

                    {/* City label */}
                    <text x={pos.x} y={pos.y - 9} textAnchor="middle"
                      style={{ fontSize: '2.2px', fontFamily: 'system-ui', fontWeight: 700, fill: isSelected ? color.stroke : 'rgba(226,232,240,0.85)' }}>
                      {zone.city}
                    </text>
                    <text x={pos.x} y={pos.y + 11} textAnchor="middle"
                      style={{ fontSize: '1.8px', fontFamily: 'system-ui', fill: color.stroke, fontWeight: 600 }}>
                      {zone.generation}MW↑ {zone.demand}MW↓
                    </text>
                  </g>
                );
              })}

              {/* State labels */}
              {[
                { x:32, y:36, text:'RAJASTHAN' },
                { x:22, y:46, text:'GUJARAT' },
                { x:26, y:59, text:'MAHARASHTRA' },
                { x:38, y:26, text:'UP' },
                { x:50, y:40, text:'MP/BIHAR' },
                { x:40, y:68, text:'KARNATAKA' },
                { x:45, y:57, text:'TELANGANA' },
                { x:46, y:77, text:'TAMIL NADU' },
                { x:65, y:44, text:'WEST BENGAL' },
              ].map(l => (
                <text key={l.text} x={l.x} y={l.y} textAnchor="middle"
                  style={{ fontSize: '1.6px', fontFamily: 'system-ui', fill: 'rgba(148,163,184,0.25)', fontWeight: 700, letterSpacing: '0.3px' }}>
                  {l.text}
                </text>
              ))}
            </svg>
          )}

          {/* Legend inside map */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            {[['🟢','#4ade80','Surplus — sell energy'],['🔴','#f87171','Deficit — buy energy'],['🟡','#fbbf24','Balanced zone']].map(([dot,color,label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
                <span style={{ color: 'var(--muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Selected city detail */}
          {selected ? (
            <div className="card" style={{ border: `1px solid ${getZoneColor(selected.status).stroke}50`, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>{selected.city}</h3>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{selected.state}</p>
                </div>
                <div style={{ padding: '.3rem .8rem', borderRadius: '20px', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', background: `${getZoneColor(selected.status).fill}`, color: getZoneColor(selected.status).stroke, border: `1px solid ${getZoneColor(selected.status).stroke}` }}>
                  {selected.status}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', marginBottom: '.75rem' }}>
                {[
                  { label: '⚡ Generation', val: `${selected.generation} MW`, color: '#4ade80' },
                  { label: '🏙️ Demand',    val: `${selected.demand} MW`,     color: '#f87171' },
                  { label: '📊 Ratio',      val: `${selected.ratio}x`,        color: '#38bdf8' },
                  { label: '⚖️ Surplus',    val: `${selected.surplus > 0 ? '+' : ''}${selected.surplus} MW`, color: selected.surplus > 0 ? '#4ade80' : '#f87171' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '.65rem .75rem' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '.25rem' }}>{s.label}</div>
                    <div style={{ fontWeight: 800, color: s.color, fontSize: '.95rem' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '.65rem .9rem', background: 'rgba(255,255,255,.03)', borderRadius: '8px', fontSize: '.8rem' }}>
                <span style={{ color: 'var(--muted)' }}>Energy Type: </span>
                <span style={{ fontWeight: 700, color: selected.type === 'Solar' ? '#fbbf24' : selected.type === 'Wind' ? '#38bdf8' : '#4ade80' }}>
                  {selected.type === 'Solar' ? '☀️' : selected.type === 'Wind' ? '💨' : '🌿'} {selected.type}
                </span>
              </div>

              {selected.status === 'deficit' && (
                <div style={{ marginTop: '.75rem', padding: '.6rem .9rem', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: '8px', fontSize: '.8rem', color: '#f87171' }}>
                  ⚠️ This area needs energy! Producers can trade here for premium.
                </div>
              )}
              {selected.status === 'surplus' && (
                <div style={{ marginTop: '.75rem', padding: '.6rem .9rem', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)', borderRadius: '8px', fontSize: '.8rem', color: '#4ade80' }}>
                  ✅ Surplus energy available! Great opportunity to buy at lower rates.
                </div>
              )}

              <button onClick={() => setSelected(null)}
                style={{ marginTop: '.75rem', width: '100%', padding: '.45rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontFamily: 'var(--font)', cursor: 'pointer', fontSize: '.82rem' }}>
                ✕ Close
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🖱️</div>
              <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Click any city on the map to see detailed energy stats</p>
            </div>
          )}

          {/* Grid summary */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '.92rem', marginBottom: '1rem' }}>📊 Grid Summary</h3>
            {[
              { label: '🟢 Surplus Cities',  val: counts.surplus,  color: '#4ade80', desc: 'selling opportunity' },
              { label: '🔴 Deficit Cities',  val: counts.deficit,  color: '#f87171', desc: 'buying opportunity'  },
              { label: '🟡 Balanced Cities', val: counts.balanced, color: '#fbbf24', desc: 'stable zone'         },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '.83rem', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{s.desc}</div>
                </div>
                <span style={{ fontWeight: 800, color: s.color, fontSize: '1.1rem' }}>{s.val}</span>
              </div>
            ))}
            <div style={{ marginTop: '.75rem', fontSize: '.78rem', color: 'var(--dim)', textAlign: 'center' }}>
              Total generation: {zones.reduce((s,z) => s+z.generation, 0).toLocaleString()} MW<br/>
              Total demand: {zones.reduce((s,z) => s+z.demand, 0).toLocaleString()} MW
            </div>
          </div>

          {/* City list */}
          <div className="card" style={{ padding: '1.25rem', maxHeight: '300px', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 800, fontSize: '.92rem', marginBottom: '.75rem' }}>🏙️ All Cities</h3>
            {filtered.map(z => {
              const color = getZoneColor(z.status);
              return (
                <div key={z.id} onClick={() => setSelected(z === selected ? null : z)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.45rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', opacity: z === selected ? 1 : 0.85, transition: 'opacity .15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color.stroke, flexShrink: 0, boxShadow: `0 0 4px ${color.stroke}` }} />
                    <span style={{ fontSize: '.83rem', fontWeight: 600 }}>{z.city}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '.72rem', color: '#4ade80' }}>{z.generation}MW↑</span>
                    <span style={{ fontSize: '.72rem', color: '#f87171' }}>{z.demand}MW↓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
