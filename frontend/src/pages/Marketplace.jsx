import { useState, useEffect } from 'react';
import { getProducers } from '../api';
import ProducerCard from '../components/ProducerCard';

const TYPES = ['All', 'Solar', 'Wind', 'Biogas'];
const SORTS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Marketplace() {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getProducers(filterType === 'All' ? undefined : filterType, sort || undefined)
      .then(r => setProducers(r.data.data))
      .catch(() => setProducers([]))
      .finally(() => setLoading(false));
  }, [filterType, sort]);

  const shown = producers.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontSize:'2rem', fontWeight:900, letterSpacing:'-1px', marginBottom:'.5rem' }}>Energy Producers</h1>
        <p style={{ color:'var(--muted)' }}>Browse verified renewable energy sources — solar, wind, and biogas</p>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap', alignItems:'center' }}>
        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name or location..."
          style={{ flex:1, minWidth:'200px', padding:'.6rem 1rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontSize:'.9rem', outline:'none', fontFamily:'var(--font)' }}
        />
        {/* Type Filter */}
        <div style={{ display:'flex', gap:'.4rem' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ padding:'.4rem 1rem', borderRadius:'20px', border:`1px solid ${filterType===t?'var(--green-border)':'var(--border)'}`, background:filterType===t?'var(--green-dim)':'transparent', color:filterType===t?'var(--green)':'var(--muted)', cursor:'pointer', fontSize:'.82rem', fontWeight:600, fontFamily:'var(--font)' }}>
              {t}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding:'.5rem .85rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontSize:'.85rem', outline:'none', cursor:'pointer', fontFamily:'var(--font)' }}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Count */}
      <p style={{ color:'var(--dim)', fontSize:'.82rem', marginBottom:'1.25rem' }}>
        Showing <strong style={{ color:'var(--green)' }}>{shown.length}</strong> producers
      </p>

      {/* Grid */}
      {loading
        ? <div className="loading-spinner" />
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
            {shown.map(p => <ProducerCard key={p.id} producer={p} />)}
          </div>
      }
    </div>
  );
}
