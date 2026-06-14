import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    const Section = ({ icon, title, children }) => (
        <div
            style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
            }}
        >
            <h2
                style={{
                    margin: '0 0 0.75rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#e6edf3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
            >
                <span>{icon}</span> {title}
            </h2>
            <div style={{ color: '#8b949e', fontSize: '0.88rem', lineHeight: 1.7 }}>
                {children}
            </div>
        </div>
    );

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0d1117',
                color: '#e6edf3',
                padding: '2rem 1rem 4rem',
                fontFamily: 'inherit',
            }}
        >
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'rgba(74,222,128,0.08)',
                        border: '1px solid rgba(74,222,128,0.2)',
                        color: '#4ade80',
                        borderRadius: '8px',
                        padding: '0.4rem 1rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        marginBottom: '2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                    }}
                >
                    ← Back
                </button>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>⚡</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80' }}>GreenHub</span>
                    </div>
                    <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', fontWeight: 800 }}>
                        Privacy Policy
                    </h1>
                    <p style={{ margin: 0, color: '#8b949e', fontSize: '0.85rem' }}>
                        Last updated: March 2025 &nbsp;·&nbsp; India's Renewable Energy Marketplace
                    </p>
                </div>

                {/* Intro */}
                <div
                    style={{
                        background: 'rgba(74,222,128,0.07)',
                        border: '1px solid rgba(74,222,128,0.2)',
                        borderRadius: '12px',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.88rem',
                        color: '#c9d1d9',
                        lineHeight: 1.7,
                    }}
                >
                    GreenHub is committed to protecting your privacy. This policy explains what data we
                    collect, how we use it, and your rights regarding your information. We do not sell
                    your personal data to any third parties.
                </div>

                <Section icon="🍪" title="Cookies & Authentication">
                    <p style={{ margin: '0 0 0.75rem' }}>
                        GreenHub uses a single authentication cookie named{' '}
                        <code
                            style={{
                                background: 'rgba(74,222,128,0.1)',
                                color: '#4ade80',
                                padding: '1px 6px',
                                borderRadius: '4px',
                            }}
                        >
                        </code>{' '}
                        to keep you securely logged in.
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        <li><strong style={{ color: '#c9d1d9' }}>Type:</strong> HTTP-only, Secure</li>
                        <li><strong style={{ color: '#c9d1d9' }}>Purpose:</strong> Authentication only</li>
                        <li><strong style={{ color: '#c9d1d9' }}>Expiry:</strong> 7 days</li>
                        <li><strong style={{ color: '#c9d1d9' }}>Third-party:</strong> None</li>
                        <li><strong style={{ color: '#c9d1d9' }}>Tracking:</strong> No tracking or advertising cookies are used</li>
                    </ul>
                </Section>

                <Section icon="📋" title="Data We Collect">
                    <p style={{ margin: '0 0 0.75rem' }}>When you register or use GreenHub, we collect:</p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        <li><strong style={{ color: '#c9d1d9' }}>Account info:</strong> Name, email address, phone number, city</li>
                        <li><strong style={{ color: '#c9d1d9' }}>Energy listings:</strong> Producer details, capacity, pricing</li>
                        <li><strong style={{ color: '#c9d1d9' }}>Transactions:</strong> Buy requests, trade history</li>
                        <li><strong style={{ color: '#c9d1d9' }}>Support:</strong> Messages submitted via the support form</li>
                    </ul>
                    <p style={{ margin: '0.75rem 0 0' }}>
                        We do not collect payment information, location data, or device fingerprints.
                    </p>
                </Section>

                <Section icon="🔒" title="Security Practices">
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        <li>Passwords are hashed using <strong style={{ color: '#c9d1d9' }}>bcryptjs</strong> — never stored in plain text</li>
                        <li>Authentication tokens use <strong style={{ color: '#c9d1d9' }}>JWT</strong> with a secret key</li>
                        <li>Cookies are set with <strong style={{ color: '#c9d1d9' }}>HttpOnly</strong> and <strong style={{ color: '#c9d1d9' }}>Secure</strong> flags</li>
                        <li>All API communication uses <strong style={{ color: '#c9d1d9' }}>HTTPS</strong> in production</li>
                        <li>Database is hosted on <strong style={{ color: '#c9d1d9' }}>MongoDB Atlas</strong> with encrypted storage</li>
                    </ul>
                </Section>

                <Section icon="🗄️" title="Data Storage">
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        <li>User data is stored in MongoDB Atlas (Mumbai, India region)</li>
                        <li>We retain your data as long as your account is active</li>
                        <li>You can request account deletion by contacting support</li>
                        <li>LocalStorage is used only to remember your cookie consent preference</li>
                    </ul>
                </Section>

                <Section icon="📧" title="Email Communications">
                    <p style={{ margin: 0 }}>
                        We send transactional emails only — no marketing or promotional emails. You will
                        receive emails when: your producer listing is approved or rejected, your buy
                        request is accepted or rejected, or our support team replies to your ticket.
                        Emails are sent via SendGrid and your address is never shared.
                    </p>
                </Section>

                <Section icon="⚖️" title="Your Rights">
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your account and data</li>
                        <li>Withdraw cookie consent at any time (clear your browser localStorage)</li>
                    </ul>
                    <p style={{ margin: '0.75rem 0 0' }}>
                        To exercise these rights, contact us via the{' '}
                        <button
                            onClick={() => navigate('/support')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#4ade80',
                                cursor: 'pointer',
                                padding: 0,
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                textDecoration: 'underline',
                            }}
                        >
                            Support page
                        </button>
                        .
                    </p>
                </Section>

                <Section icon="📞" title="Contact">
                    <p style={{ margin: 0 }}>
                        For privacy-related queries, reach us via our{' '}
                        <button
                            onClick={() => navigate('/support')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#4ade80',
                                cursor: 'pointer',
                                padding: 0,
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                textDecoration: 'underline',
                            }}
                        >
                            Support page
                        </button>
                        . We aim to respond within 48 hours.
                    </p>
                </Section>

                <p style={{ textAlign: 'center', color: '#484f58', fontSize: '0.78rem', marginTop: '2rem' }}>
                    © 2025 GreenHub — India's Renewable Energy Marketplace
                </p>
            </div>
        </div>
    );
}
