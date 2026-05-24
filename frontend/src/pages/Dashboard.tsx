import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    IconHome,
    IconList,
    IconSend,
    IconPigMoney,
    IconSettings,
} from '@tabler/icons-react';

export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Home', icon: IconHome },
        { path: '/dashboard/transactions', label: 'History', icon: IconList },
        { path: '/dashboard/transfer', label: 'Send', icon: IconSend },
        { path: '/dashboard/savings', label: 'Savings', icon: IconPigMoney },
        { path: '/dashboard/settings', label: 'Settings', icon: IconSettings },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <div style={{
            backgroundColor: '#0D0F1A',
            minHeight: '100vh',
            maxWidth: '430px',
            margin: '0 auto',
            position: 'relative',
            paddingBottom: '80px',
        }}>
            {/* Page content */}
            <div style={{ overflowY: 'auto' }}>
                <Outlet context={{ logout, navigate }} />
            </div>

            {/* Bottom navigation */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '430px',
                backgroundColor: '#141620',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0 20px',
                zIndex: 100,
            }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 12px',
                                color: active ? '#8B5CF6' : '#94A3B8',
                            }}>
                            <Icon size={22} stroke={active ? 2 : 1.5} />
                            <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}