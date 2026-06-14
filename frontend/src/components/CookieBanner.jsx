import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CONSENT_KEY = 'cookieConsent';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const existing = localStorage.getItem(CONSENT_KEY);
        if (!existing) {
            /* Small delay so it doesn't flash on first paint */
            const t = setTimeout(() => {
                setVisible(true);
                requestAnimationFrame(() => setAnimate(true));
            }, 800);
            return () => clearTimeout(t);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        dismiss();
    };

    const handleReject = () => {
        localStorage.setItem(CONSENT_KEY, 'rejected');
        dismiss();
    };

    const dismiss = () => {
        setAnimate(false);
        setTimeout(() => setVisible(false), 350);
    };

    if (!visible) return null;

    return (
        <>
            {/* Backdrop blur — subtle */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 998,
                    pointerEvents: 'none',
                }}
                aria-hidden="true"
            />

            {/* Banner */}
            <div
                role="dialog"
                aria-modal="false"
                aria-label="Cookie consent"
                aria-describedby="cookie-desc"
                style={{
                    position: 'fixed',
                    bottom: animate ? '1.25rem' : '-200px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 999,
                    width: 'min(640px, calc(100vw - 2rem))',
                    background: 'rgba(22, 27, 34, 0.97)',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    borderRadius: '14px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.08)',
                    backdropFilter: 'blur(16px)',
                    opacity: animate ? 1 : 0,
                    transition: 'bottom 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                {/* Header */}
                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🍪</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e6edf3' }}>
                        We use cookies
                    </span>
                </div> */}

                {/* Description */}
                <p
                    id="cookie-desc"
                    style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        color: '#8b949e',
                        lineHeight: 1.6,
                    }}
                >
                    GreenHub uses essential cookies for authentication
                    {/* <code
                        style={{
                            background: 'rgba(74,222,128,0.1)',
                            color: '#4ade80',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                        }}
                    >
                        gh_token
                    </code> */}
                    to keep you logged in securely. We do not use tracking or advertising cookies.{' '}
                    <button
                        onClick={() => navigate('/privacy-policy')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#4ade80',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.82rem',
                            textDecoration: 'underline',
                            fontFamily: 'inherit',
                        }}
                        aria-label="Read our Privacy Policy"
                    >
                        Privacy Policy →
                    </button>
                </p>

                {/* Buttons */}
                <div
                    style={{
                        display: 'flex',
                        gap: '0.6rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <button
                        onClick={handleAccept}
                        autoFocus
                        style={{
                            flex: '1 1 120px',
                            padding: '0.55rem 1.25rem',
                            background: 'linear-gradient(135deg, #059669, #4ade80)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        aria-label="Accept cookies"
                    >
                         Accept
                    </button>

                    <button
                        onClick={handleReject}
                        style={{
                            flex: '1 1 120px',
                            padding: '0.55rem 1.25rem',
                            background: 'transparent',
                            color: '#8b949e',
                            border: '1px solid rgba(139,148,158,0.3)',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(139,148,158,0.6)';
                            e.currentTarget.style.color = '#c9d1d9';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(139,148,158,0.3)';
                            e.currentTarget.style.color = '#8b949e';
                        }}
                        aria-label="Reject non-essential cookies"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </>
    );
}
