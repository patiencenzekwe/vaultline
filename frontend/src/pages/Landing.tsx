import { useNavigate } from 'react-router-dom';

const features = [
    {
        title: 'Zero-trust security',
        desc: 'Istio enforces mutual TLS between all services. HashiCorp Vault generates dynamic credentials that rotate automatically.',
    },
    {
        title: 'Instant transfers',
        desc: 'ACID-compliant fund transfers with PostgreSQL row locking. Every transaction is atomic. All or nothing.',
    },
    {
        title: 'Full observability',
        desc: 'Prometheus metrics, Grafana dashboards, and distributed tracing across every microservice.',
    },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#0D0F1A', minHeight: '100vh', color: '#F1F5F9' }}>

            {/* Navigation */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px 48px',
                borderBottom: '1px solid #1a1d2e',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#8B5CF6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                    }}>V</div>
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>Vaultline</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none',
                            border: '1px solid #94A3B8',
                            color: '#F1F5F9',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}>
                        Sign in
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            background: '#8B5CF6',
                            border: 'none',
                            color: '#F1F5F9',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}>
                        Get started
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '120px 48px 80px',
                textAlign: 'center',
            }}>
                <div style={{
                    display: 'inline-block',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #8B5CF6',
                    borderRadius: '100px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    color: '#8B5CF6',
                    marginBottom: '32px',
                }}>
                    AWS EKS · Istio mTLS · HashiCorp Vault
                </div>

                <h1 style={{
                    fontSize: '64px',
                    fontWeight: '800',
                    lineHeight: '1.1',
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, #F1F5F9 0%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Production-grade banking platform
                </h1>

                <p style={{
                    fontSize: '20px',
                    color: '#94A3B8',
                    lineHeight: '1.7',
                    maxWidth: '600px',
                    margin: '0 auto 48px',
                }}>
                    A banking platform deployed on AWS EKS, with enterprise security, GitOps delivery, and zero-trust networking at every layer.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            background: '#8B5CF6',
                            border: 'none',
                            color: '#F1F5F9',
                            padding: '16px 40px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                        }}>
                        Open an account
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#1a1d2e',
                            border: '1px solid #1a1d2e',
                            color: '#F1F5F9',
                            padding: '16px 40px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}>
                        Sign in
                    </button>
                </div>
            </div>

            {/* Features */}
            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '0 48px 120px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
            }}>
                {features.map((feature) => (
                    <div key={feature.title} style={{
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '16px',
                        padding: '32px',
                    }}>
                        <div style={{
                            width: '40px',
                            height: '4px',
                            backgroundColor: '#8B5CF6',
                            borderRadius: '2px',
                            marginBottom: '20px',
                        }} />
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            marginBottom: '12px',
                            color: '#F1F5F9',
                        }}>
                            {feature.title}
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#94A3B8',
                            lineHeight: '1.7',
                            margin: 0,
                        }}>
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                borderTop: '1px solid #1a1d2e',
                padding: '32px 48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#94A3B8',
                fontSize: '14px',
            }}>
                <span>© 2026 Vaultline. Built by Patience Nzekwe.</span>
                <span>api.vaultline.uk</span>
            </div>
        </div>
    );
}