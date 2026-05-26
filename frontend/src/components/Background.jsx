export default function Background() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', bottom: '-300px', left: '-200px', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '400px', height: '400px', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(74,222,128,0.03) 0%, transparent 65%)' }} />
    </div>
  );
}
