import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    IconFingerprint,
    IconShieldLock,
    IconBell,
    IconList,
    IconUser,
    IconCreditCard,
    IconFileText,
    IconServer,
    IconLock,
    IconChartBar,
    IconLogout,
    IconChevronRight,
} from '@tabler/icons-react';

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initials = user?.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U';

    type BadgeType = 'on' | 'live' | 'none';

    const SettingItem = ({
        icon,
        iconColor,
        iconBg,
        title,
        desc,
        badge,
        onClick,
    }: {
        icon: React.ReactNode;
        iconColor: string;
        iconBg: string;
        title: string;
        desc: string;
        badge?: BadgeType;
        onClick?: () => void;
    }) => (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '13px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: onClick ? 'pointer' : 'default',
            }}>
            <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: iconColor,
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px', color: '#F1F5F9' }}>{title}</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {badge === 'on' && (
                    <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                        borderRadius: '20px', backgroundColor: 'rgba(16,185,129,0.12)',
                        color: '#10B981',
                    }}>On</span>
                )}
                {badge === 'live' && (
                    <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                        borderRadius: '20px', backgroundColor: 'rgba(139,92,246,0.12)',
                        color: '#A78BFA',
                    }}>Live</span>
                )}
                {badge !== 'live' && badge !== 'on' && (
                    <IconChevronRight size={14} color="#475569" />
                )}
            </div>
        </div>
    );

    const SectionLabel = ({ label }: { label: string }) => (
        <div style={{
            padding: '14px 14px 6px',
            fontSize: '11px',
            fontWeight: '500',
            color: '#475569',
            letterSpacing: '0.5px',
        }}>
            {label.toUpperCase()}
        </div>
    );

    return (
        <div style={{ color: '#F1F5F9' }}>
            {/* Header */}
            <div style={{ padding: '16px 16px 10px' }}>
                <h1 style={{ fontSize: '17px', fontWeight: '600', margin: 0 }}>Settings</h1>
            </div>

            {/* Profile card */}
            <div style={{
                margin: '0 14px 16px',
                backgroundColor: '#1a1d2e',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '16px',
                    flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 2px' }}>{user?.full_name}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{user?.email}</p>
                </div>
                <button style={{
                    backgroundColor: '#141620',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    color: '#94A3B8',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                }}>
                    Edit
                </button>
            </div>

            {/* Security */}
            <SectionLabel label="Security" />
            <div style={{ backgroundColor: '#1a1d2e', margin: '0 14px 8px', borderRadius: '14px', overflow: 'hidden' }}>
                <SettingItem icon={<IconFingerprint size={16} />} iconColor="#10B981" iconBg="rgba(16,185,129,0.12)" title="Biometric login" desc="Face ID or Touch ID" badge="on" />
                <SettingItem icon={<IconShieldLock size={16} />} iconColor="#8B5CF6" iconBg="rgba(139,92,246,0.12)" title="Two-factor authentication" desc="Authenticator app configured" badge="on" />
                <SettingItem icon={<IconBell size={16} />} iconColor="#F59E0B" iconBg="rgba(245,158,11,0.12)" title="Transaction alerts" desc="Instant push and email" badge="on" />
                <SettingItem icon={<IconList size={16} />} iconColor="#60A5FA" iconBg="rgba(96,165,250,0.12)" title="Login activity" desc="View recent sessions" />
            </div>

            {/* Account */}
            <SectionLabel label="Account" />
            <div style={{ backgroundColor: '#1a1d2e', margin: '0 14px 8px', borderRadius: '14px', overflow: 'hidden' }}>
                <SettingItem icon={<IconUser size={16} />} iconColor="#10B981" iconBg="rgba(16,185,129,0.12)" title="Personal details" desc="Name, phone, address" />
                <SettingItem icon={<IconCreditCard size={16} />} iconColor="#8B5CF6" iconBg="rgba(139,92,246,0.12)" title="Cards and limits" desc="Manage spending limits" />
                <SettingItem icon={<IconFileText size={16} />} iconColor="#94A3B8" iconBg="rgba(148,163,184,0.12)" title="Statements" desc="Download PDF statements" />
            </div>

            {/* Platform health */}
            <SectionLabel label="Platform health" />
            <div style={{ backgroundColor: '#1a1d2e', margin: '0 14px 8px', borderRadius: '14px', overflow: 'hidden' }}>
                <SettingItem icon={<IconServer size={16} />} iconColor="#10B981" iconBg="rgba(16,185,129,0.12)" title="AWS EKS — eu-west-2" desc="All systems operational" badge="live" />
                <SettingItem icon={<IconLock size={16} />} iconColor="#8B5CF6" iconBg="rgba(139,92,246,0.12)" title="HashiCorp Vault" desc="Dynamic credentials active" badge="on" />
                <SettingItem icon={<IconChartBar size={16} />} iconColor="#60A5FA" iconBg="rgba(96,165,250,0.12)" title="Prometheus monitoring" desc="All metrics nominal" badge="on" />
            </div>

            {/* Danger zone */}
            <SectionLabel label="Danger zone" />
            <div style={{ backgroundColor: '#1a1d2e', margin: '0 14px 24px', borderRadius: '14px', overflow: 'hidden' }}>
                <SettingItem
                    icon={<IconLogout size={16} />}
                    iconColor="#F43F5E"
                    iconBg="rgba(244,63,94,0.12)"
                    title="Sign out"
                    desc="End your current session"
                    onClick={handleLogout}
                />
            </div>
        </div>
    );
}