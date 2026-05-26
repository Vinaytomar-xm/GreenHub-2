import { useNotification } from '../context/NotificationContext';

export default function Notification() {
  const { notif } = useNotification();
  if (!notif) return null;
  const bg = notif.type === 'success'
    ? 'linear-gradient(135deg, #059669, #10b981)'
    : notif.type === 'error'
    ? 'linear-gradient(135deg, #dc2626, #ef4444)'
    : 'linear-gradient(135deg, #d97706, #f59e0b)';
  return (
    <div key={notif.id} className="fade-in" style={{
      position:'fixed', top:'74px', right:'20px', zIndex:9999,
      background: bg, color:'#fff', padding:'.75rem 1.5rem',
      borderRadius:'8px', fontWeight:600, fontSize:'.9rem',
      boxShadow:'0 4px 20px rgba(0,0,0,0.4)', maxWidth:'360px',
    }}>
      {notif.type === 'success' ? '✓' : '⚠'} {notif.msg}
    </div>
  );
}
