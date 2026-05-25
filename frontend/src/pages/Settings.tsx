import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, accountService, transactionService } from '../services/api';
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
    IconX,
    IconCheck,
    IconEye,
    IconEyeOff,
} from '@tabler/icons-react';

export default function Settings() {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();

    // Sheets
    const [sheet, setSheet] = useState<string | null>(null);

    // Profile form
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Sessions
    const [sessions, setSessions] = useState<any[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    // Limits
    const [limits, setLimits] = useState<any>(null);
    const [limitsLoading, setLimitsLoading] = useState(false);

    // Accounts for export and limits
    const [accounts, setAccounts] = useState<any[]>([]);
    const [exportLoading, setExportLoading] = useState(false);

    // Toggles
    const [toggles, setToggles] = useState({
        biometric: true,
        twoFactor: true,
        alerts: true,
    });

    useEffect(() => {
        authService.profile().then((res) => {
            setFullName(res.data.user.full_name);
            setPhone(res.data.user.phone || '');
        });
        accountService.getAccounts().then((res) => {
            setAccounts(res.data.accounts);
        });
    }, []);

    const initials = user?.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U';

    const handleUpdateProfile = async () => {
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');
        try {
            await authService.updateProfile({ full_name: fullName, phone });
            setProfileSuccess('Profile updated successfully.');
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setProfileError(axiosError.response?.data?.error || 'Failed to update profile.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');
        try {
            await authService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
            });
            setPasswordSuccess('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setPasswordError(axiosError.response?.data?.error || 'Failed to change password.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLoadSessions = async () => {
        setSheet('sessions');
        setSessionsLoading(true);
        try {
            const res = await authService.getSessions();
            setSessions(res.data.sessions);
        } catch {
            setSessions([]);
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleLoadLimits = async () => {
        setSheet('limits');
        if (accounts.length === 0) return;
        setLimitsLoading(true);
        try {
            const res = await accountService.getLimits(accounts[0].id);
            setLimits(res.data.limits);
        } catch {
            setLimits(null);
        } finally {
            setLimitsLoading(false);
        }
    };

    const handleExportStatement = async () => {
        if (accounts.length === 0) return;
        setExportLoading(true);
        try {
            const res = await transactionService.exportTransactions(accounts[0].id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `vaultline-statement-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            // silent fail
        } finally {
            setExportLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const inputStyle = {
        width: '100%',
        backgroundColor: '#0D0F1A',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '12px 14px',
        color: '#F1F5F9',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box' as const,
        fontFamily: 'inherit',
        marginBottom: '10px',
    };

    const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
        <div
            onClick={onChange}
            style={{
                width: '40px',
                height: '22px',
                borderRadius: '11px',
                backgroundColor: value ? '#8B5CF6' : 'rgba(255,255,255,0.15)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                flexShrink: 0,
            }}>
            <div style={{
                position: 'absolute',
                top: '3px',
                left: value ? '21px' : '3px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                transition: 'left 0.2s',
            }} />
        </div>
    );

    const SettingItem = ({
        icon,
        iconColor,
        iconBg,
        title,
        desc,
        toggle,
        toggleValue,
        onToggle,
        onClick,
        badge,
    }: {
        icon: React.ReactNode;
        iconColor: string;
        iconBg: string;
        title: string;
        desc: string;
        toggle?: boolean;
        toggleValue?: boolean;
        onToggle?: () => void;
        onClick?: () => void;
        badge?: string;
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
            {toggle && onToggle && (
                <Toggle value={toggleValue || false} onChange={onToggle} />
            )}
            {badge && (
                <span style={{
                    fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                    borderRadius: '20px', backgroundColor: 'rgba(139,92,246,0.12)',
                    color: '#A78BFA',
                }}>{badge}</span>
            )}
            {!toggle && !badge && onClick && (
                <IconChevronRight size={14} color="#475569" />
            )}
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

    const Sheet = ({ children }: { children: React.ReactNode }) => (
        <div
            onClick={() => setSheet(null)}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
            }}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '430px',
                    backgroundColor: '#141620',
                    borderRadius: '24px 24px 0 0',
                    padding: '24px',
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                }}>
                <div style={{
                    width: '36px',
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    margin: '0 auto 20px',
                }} />
                {children}
            </div>
        </div>
    );

    return (
        <div style={{ color: '#F1F5F9', paddingBottom: '8px' }}>
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
                    width: '48px', height: '48px', borderRadius: '50%',
                    backgroundColor: '#8B5CF6', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '16px', flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 2px' }}>{user?.full_name}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{user?.email}</p>
                </div>
                <button
                    onClick={() => setSheet('profile')}
                    style={{
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
                <SettingItem
                    icon={<IconFingerprint size={16} />} iconColor="#10B981" iconBg="rgba(16,185,129,0.12)"
                    title="Biometric login" desc={toggles.biometric ? 'Face ID enabled' : 'Face ID disabled'}
                    toggle toggleValue={toggles.biometric}
                    onToggle={() => setToggles(t => ({ ...t, biometric: !t.biometric }))}
                />
                <SettingItem
                    icon={<IconShieldLock size={16} />} iconColor="#8B5CF6" iconBg="rgba(139,92,246,0.12)"
                    title="Two-factor authentication" desc={toggles.twoFactor ? 'Authenticator app active' : '2FA disabled'}
                    toggle toggleValue={toggles.twoFactor}
                    onToggle={() => setToggles(t => ({ ...t, twoFactor: !t.twoFactor }))}
                />
                <SettingItem
                    icon={<IconBell size={16} />} iconColor="#F59E0B" iconBg="rgba(245,158,11,0.12)"
                    title="Transaction alerts" desc={toggles.alerts ? 'Push and email enabled' : 'Alerts disabled'}
                    toggle toggleValue={toggles.alerts}
                    onToggle={() => setToggles(t => ({ ...t, alerts: !t.alerts }))}
                />
                <SettingItem
                    icon={<IconLock size={16} />} iconColor="#60A5FA" iconBg="rgba(96,165,250,0.12)"
                    title="Change password" desc="Update your account password"
                    onClick={() => setSheet('password')}
                />
                <SettingItem
                    icon={<IconList size={16} />} iconColor="#94A3B8" iconBg="rgba(148,163,184,0.12)"
                    title="Login activity" desc="View recent sessions"
                    onClick={handleLoadSessions}
                />
            </div>

            {/* Account */}
            <SectionLabel label="Account" />
            <div style={{ backgroundColor: '#1a1d2e', margin: '0 14px 8px', borderRadius: '14px', overflow: 'hidden' }}>
                <SettingItem
                    icon={<IconUser size={16} />} iconColor="#10B981" iconBg="rgba(16,185,129,0.12)"
                    title="Personal details" desc="Name, phone number"
                    onClick={() => setSheet('profile')}
                />
                <SettingItem
                    icon={<IconCreditCard size={16} />} iconColor="#8B5CF6" iconBg="rgba(139,92,246,0.12)"
                    title="Cards and limits" desc="View your spending limits"
                    onClick={handleLoadLimits}
                />
                <SettingItem
                    icon={<IconFileText size={16} />} iconColor="#94A3B8" iconBg="rgba(148,163,184,0.12)"
                    title="Download statement" desc={exportLoading ? 'Downloading...' : 'Export transactions as CSV'}
                    onClick={handleExportStatement}
                />
            </div>

            {/* Platform health */}
            <SectionLabel label="Platform health" />
            <div style={{ backgroundColor: '#1a1d2e', margin: '0 14px 8px', borderRadius: '14px', overflow: 'hidden' }}>
                <SettingItem
                    icon={<IconServer size={16} />} iconColor="#10B981" iconBg="rgba(16,185,129,0.12)"
                    title="AWS EKS — eu-west-2" desc="All systems operational" badge="Live"
                />
                <SettingItem
                    icon={<IconLock size={16} />} iconColor="#8B5CF6" iconBg="rgba(139,92,246,0.12)"
                    title="HashiCorp Vault" desc="Dynamic credentials active" badge="On"
                />
                <SettingItem
                    icon={<IconChartBar size={16} />} iconColor="#60A5FA" iconBg="rgba(96,165,250,0.12)"
                    title="Prometheus monitoring" desc="All metrics nominal" badge="On"
                />
            </div>

            {/* Danger zone */}
            <SectionLabel label="Danger zone" />
            <div style={{ backgroundColor: '#1a1d2e', margin: '0 14px 24px', borderRadius: '14px', overflow: 'hidden' }}>
                <SettingItem
                    icon={<IconLogout size={16} />} iconColor="#F43F5E" iconBg="rgba(244,63,94,0.12)"
                    title="Sign out" desc="End your current session"
                    onClick={handleLogout}
                />
            </div>

            {/* Profile sheet */}
            {sheet === 'profile' && (
                <Sheet>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>Personal details</h2>
                        <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Full name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={inputStyle}
                    />
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Phone number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+447911123456"
                        style={inputStyle}
                    />
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Email address</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                    />
                    <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 16px' }}>
                        Email address cannot be changed.
                    </p>
                    {profileError && (
                        <div style={{ backgroundColor: 'rgba(244,63,94,0.12)', border: '1px solid #F43F5E', borderRadius: '10px', padding: '10px 14px', color: '#F43F5E', fontSize: '13px', marginBottom: '12px' }}>
                            {profileError}
                        </div>
                    )}
                    {profileSuccess && (
                        <div style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', borderRadius: '10px', padding: '10px 14px', color: '#10B981', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconCheck size={14} /> {profileSuccess}
                        </div>
                    )}
                    <button
                        onClick={handleUpdateProfile}
                        disabled={profileLoading}
                        style={{
                            width: '100%', backgroundColor: profileLoading ? '#6D44CC' : '#8B5CF6',
                            border: 'none', color: '#F1F5F9', padding: '14px', borderRadius: '12px',
                            fontSize: '15px', fontWeight: '600', cursor: profileLoading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                        }}>
                        {profileLoading ? 'Saving...' : 'Save changes'}
                    </button>
                </Sheet>
            )}

            {/* Password sheet */}
            {sheet === 'password' && (
                <Sheet>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>Change password</h2>
                        <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Current password</label>
                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            style={{ ...inputStyle, marginBottom: 0, paddingRight: '40px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            {showCurrentPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                    </div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>New password</label>
                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ ...inputStyle, marginBottom: 0, paddingRight: '40px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                    </div>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 16px' }}>
                        Min 8 characters, uppercase, number, and special character.
                    </p>
                    {passwordError && (
                        <div style={{ backgroundColor: 'rgba(244,63,94,0.12)', border: '1px solid #F43F5E', borderRadius: '10px', padding: '10px 14px', color: '#F43F5E', fontSize: '13px', marginBottom: '12px' }}>
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', borderRadius: '10px', padding: '10px 14px', color: '#10B981', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconCheck size={14} /> {passwordSuccess}
                        </div>
                    )}
                    <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        style={{
                            width: '100%', backgroundColor: passwordLoading ? '#6D44CC' : '#8B5CF6',
                            border: 'none', color: '#F1F5F9', padding: '14px', borderRadius: '12px',
                            fontSize: '15px', fontWeight: '600', cursor: passwordLoading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                        }}>
                        {passwordLoading ? 'Changing...' : 'Change password'}
                    </button>
                </Sheet>
            )}

            {/* Sessions sheet */}
            {sheet === 'sessions' && (
                <Sheet>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>Login activity</h2>
                        <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    {sessionsLoading ? (
                        <p style={{ color: '#94A3B8', textAlign: 'center', padding: '24px 0' }}>Loading...</p>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} style={{
                                backgroundColor: '#0D0F1A',
                                borderRadius: '12px',
                                padding: '14px',
                                marginBottom: '10px',
                                border: session.current ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#F1F5F9' }}>{session.device}</p>
                                    {session.current && (
                                        <span style={{ fontSize: '10px', backgroundColor: 'rgba(139,92,246,0.12)', color: '#A78BFA', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 2px' }}>
                                    {session.location} · {session.ip}
                                </p>
                                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 2px' }}>
                                    Signed in: {new Date(session.login_time).toLocaleString('en-GB')}
                                </p>
                                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                                    Expires: {new Date(session.expires_at).toLocaleString('en-GB')}
                                </p>
                            </div>
                        ))
                    )}
                </Sheet>
            )}

            {/* Limits sheet */}
            {sheet === 'limits' && (
                <Sheet>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>Cards and limits</h2>
                        <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    {limitsLoading ? (
                        <p style={{ color: '#94A3B8', textAlign: 'center', padding: '24px 0' }}>Loading...</p>
                    ) : limits ? (
                        <>
                            {[
                                { label: 'Single transfer limit', value: `£${limits.single_transfer_limit.toLocaleString()}` },
                                { label: 'Daily transfer limit', value: `£${limits.daily_transfer_limit.toLocaleString()}` },
                                { label: 'ATM daily limit', value: `£${limits.atm_daily_limit.toLocaleString()}` },
                                { label: 'Contactless limit', value: `£${limits.contactless_limit.toLocaleString()}` },
                                { label: 'Currency', value: limits.currency },
                            ].map((item) => (
                                <div key={item.label} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
                                }}>
                                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>{item.label}</p>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#F1F5F9', margin: 0 }}>{item.value}</p>
                                </div>
                            ))}
                        </>
                    ) : (
                        <p style={{ color: '#94A3B8', textAlign: 'center', padding: '24px 0' }}>Failed to load limits.</p>
                    )}
                </Sheet>
            )}
        </div>
    );
}