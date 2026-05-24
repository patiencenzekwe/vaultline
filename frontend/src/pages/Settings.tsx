import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const settingRow = (label: string, value: string) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0',
            borderBottom: '1px solid #1a1d2e',
        }}>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>{label}</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{value}</span>
        </div>
    );

    const platformRow = (label: string, status: string, color: string) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0',
            borderBottom: '1px solid #1a1d2e',
        }}>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>{label}</span>
            <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color,
                backgroundColor: `${color}20`,
                padding: '4px 10px',
                borderRadius: '100px',
            }}>{status}</span>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>Settings</h1>
                <p style={{ color: '#94A3B8', margin: 0 }}>Manage your account and preferences</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
            }}>
                {/* Profile */}
                <div style={{
                    backgroundColor: '#141620',
                    border: '1px solid #1a1d2e',
                    borderRadius: '16px',
                    padding: '24px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                        paddingBottom: '24px',
                        borderBottom: '1px solid #1a1d2e',
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#8B5CF6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '24px',
                            flexShrink: 0,
                        }}>
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{user?.full_name}</p>
                            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>{user?.email}</p>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>Account details</h3>
                    {settingRow('Full name', user?.full_name || '—')}
                    {settingRow('Email', user?.email || '—')}
                    {settingRow('Member since', user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                        : '—'
                    )}
                </div>

                {/* Platform health */}
                <div>
                    <div style={{
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '16px',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>Platform health</h3>
                        {platformRow('EKS cluster', 'Operational', '#10B981')}
                        {platformRow('Vault secrets', 'Active', '#10B981')}
                        {platformRow('Istio mTLS', 'Enforced', '#10B981')}
                        {platformRow('API gateway', 'Healthy', '#10B981')}
                        <div style={{ paddingTop: '4px' }} />
                        {platformRow('RDS PostgreSQL', 'Multi-AZ active', '#10B981')}
                    </div>

                    {/* Security */}
                    <div style={{
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '16px',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>Security</h3>
                        {platformRow('Mutual TLS', 'Strict mode', '#8B5CF6')}
                        {platformRow('Dynamic credentials', 'Vault managed', '#8B5CF6')}
                        {platformRow('JWT tokens', '24h expiry', '#8B5CF6')}
                    </div>

                    {/* Danger zone */}
                    <div style={{
                        backgroundColor: '#141620',
                        border: '1px solid #F43F5E40',
                        borderRadius: '16px',
                        padding: '24px',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px', color: '#F43F5E' }}>
                            Sign out
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px' }}>
                            You will be returned to the landing page.
                        </p>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                backgroundColor: 'transparent',
                                border: '1px solid #F43F5E',
                                color: '#F43F5E',
                                padding: '12px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                            }}>
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}        