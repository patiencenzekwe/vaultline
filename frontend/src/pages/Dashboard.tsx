import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Home', icon: '⊞' },
        { path: '/dashboard/transfer', label: 'Transfer', icon: '↗' },
        { path: '/dashboard/transactions', label: 'Transactions', icon: '≡' },
        { path: '/dashboard/settings', label: 'Settings', icon: '⚙' },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#0D0F1A',
            color: '#F1F5F9',
        }}>
            {/* Sidebar */}
            <div style={{
                width: '240px',
                backgroundColor: '#141620',
                borderRight: '1px solid #1a1d2e',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                flexShrink: 0,
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    marginBottom: '32px',
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#8B5CF6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                    }}>V</div>
                    <span style={{ fontWeight: '700', fontSize: '18px' }}>Vaultline</span>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: isActive(item.path) ? '#8B5CF620' : 'transparent',
                                color: isActive(item.path) ? '#8B5CF6' : '#94A3B8',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: isActive(item.path) ? '600' : '400',
                                marginBottom: '4px',
                                textAlign: 'left',
                            }}>
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User profile */}
                <div style={{
                    borderTop: '1px solid #1a1d2e',
                    paddingTop: '16px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#8B5CF6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '14px',
                            flexShrink: 0,
                        }}>
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.full_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid #1a1d2e',
                            borderRadius: '8px',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}>
                        Sign out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
                <Outlet />
            </div>
        </div>
    );
}