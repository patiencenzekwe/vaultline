import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService } from '../services/api';
import type { Account, Transaction } from '../types';
import {
    IconSend,
    IconArrowDown,
    IconCirclePlus,
    IconDots,
    IconArrowUpRight,
    IconArrowDownLeft,
    IconCopy,
    IconCheck,
    IconChevronRight,
} from '@tabler/icons-react';

const Sheet = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div
        onClick={onClose}
        style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 200, display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center',
        }}>
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                width: '100%', maxWidth: '430px',
                backgroundColor: '#141620',
                borderRadius: '24px 24px 0 0',
                padding: '24px',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                maxHeight: '85vh',
                overflowY: 'auto',
            }}>
            <div style={{
                width: '36px', height: '4px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '2px', margin: '0 auto 20px',
            }} />
            {children}
        </div>
    </div>
);

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [sheet, setSheet] = useState<'request' | 'addmoney' | 'more' | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountsRes = await accountService.getAccounts();
                setAccounts(accountsRes.data.accounts);
                if (accountsRes.data.accounts.length > 0) {
                    const txRes = await transactionService.getTransactions(
                        accountsRes.data.accounts[0].id, 5
                    );
                    setTransactions(txRes.data.transactions);
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const totalBalance = accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.balance), 0
    );

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short',
        });
    };

    const copyToClipboard = async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const currentAccount = accounts[0];

    const requestMessage = currentAccount
        ? `Hi, please send payment to my Vaultline account:\nName: ${user?.full_name}\nAccount: ${currentAccount.account_number}\nSort code: 40-47-84`
        : '';

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading...</div>
            </div>
        );
    }

    const DetailRow = ({
        label, value, copyKey,
    }: { label: string; value: string; copyKey: string }) => (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
            <div>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#F1F5F9', margin: 0, fontFamily: 'monospace' }}>
                    {value}
                </p>
            </div>
            <button
                onClick={() => copyToClipboard(value, copyKey)}
                style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', padding: '6px 10px',
                    color: copied === copyKey ? '#10B981' : '#94A3B8',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '4px', fontSize: '11px',
                }}>
                {copied === copyKey ? <IconCheck size={12} /> : <IconCopy size={12} />}
                {copied === copyKey ? 'Copied' : 'Copy'}
            </button>
        </div>
    );

    return (
        <div style={{ color: '#F1F5F9', paddingBottom: '8px' }}>

            {/* Hero card */}
            <div style={{
                margin: '14px 14px 16px', borderRadius: '22px', padding: '20px',
                background: 'linear-gradient(135deg, #1a1040 0%, #2d1b69 60%, #1a1040 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: '-40px', right: '-20px',
                    width: '130px', height: '130px', borderRadius: '50%',
                    background: 'rgba(139,92,246,0.18)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-30px', left: '10px',
                    width: '90px', height: '90px', borderRadius: '50%',
                    background: 'rgba(139,92,246,0.10)',
                }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 2px' }}>
                    {getGreeting()}
                </p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#fff', margin: '0 0 14px' }}>
                    {user?.full_name?.split(' ')[0]}
                </p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px', margin: '0 0 3px' }}>
                    TOTAL BALANCE
                </p>
                <p style={{
                    fontSize: '34px', fontWeight: '500', letterSpacing: '-1.5px',
                    color: '#fff', margin: '0 0 16px', position: 'relative', zIndex: 1,
                }}>
                    {formatCurrency(totalBalance)}
                </p>
                <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
                    <div style={{ flex: 1, paddingRight: '12px', marginRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>Accounts</p>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>{accounts.length}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>Currency</p>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>GBP</p>
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px', padding: '0 14px 16px',
            }}>
                {[
                    { label: 'Send', icon: <IconSend size={20} />, action: () => navigate('/dashboard/transfer') },
                    { label: 'Request', icon: <IconArrowDown size={20} />, action: () => setSheet('request') },
                    { label: 'Add money', icon: <IconCirclePlus size={20} />, action: () => setSheet('addmoney') },
                    { label: 'More', icon: <IconDots size={20} />, action: () => setSheet('more') },
                ].map((item) => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#F1F5F9',
                        }}>
                            {item.icon}
                        </div>
                        <span style={{ fontSize: '10px', color: '#94A3B8' }}>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Account cards */}
            <div style={{ padding: '0 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Accounts</span>
                <button style={{ background: 'none', border: 'none', color: '#A78BFA', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                    See all
                </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '0 14px 16px', overflowX: 'auto' }}>
                {accounts.map((account) => (
                    <div key={account.id} style={{
                        flexShrink: 0, width: '155px',
                        backgroundColor: '#1a1d2e',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderTop: `2px solid ${account.account_type === 'current' ? '#8B5CF6' : '#10B981'}`,
                        borderRadius: '18px', padding: '14px',
                    }}>
                        <div style={{
                            display: 'inline-block', fontSize: '10px',
                            padding: '3px 8px', borderRadius: '20px',
                            marginBottom: '10px', fontWeight: '500',
                            backgroundColor: account.account_type === 'current' ? 'rgba(139,92,246,0.12)' : 'rgba(16,185,129,0.12)',
                            color: account.account_type === 'current' ? '#A78BFA' : '#10B981',
                            textTransform: 'capitalize' as const,
                        }}>
                            {account.account_type}
                        </div>
                        <p style={{ fontSize: '20px', fontWeight: '500', color: '#F1F5F9', margin: '0 0 4px' }}>
                            {formatCurrency(account.balance)}
                        </p>
                        <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>
                            •••• {account.account_number.slice(-4)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent transactions */}
            <div style={{ padding: '0 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Recent transactions</span>
                <button
                    onClick={() => navigate('/dashboard/transactions')}
                    style={{ background: 'none', border: 'none', color: '#A78BFA', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                    See all
                </button>
            </div>

            <div style={{ padding: '0 14px' }}>
                {transactions.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                        No transactions yet
                    </p>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '12px',
                                backgroundColor: tx.transaction_type === 'credit' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                color: tx.transaction_type === 'credit' ? '#10B981' : '#F43F5E',
                            }}>
                                {tx.transaction_type === 'credit'
                                    ? <IconArrowDownLeft size={18} />
                                    : <IconArrowUpRight size={18} />
                                }
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px' }}>
                                    {tx.description || tx.transaction_type}
                                </p>
                                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                                    {formatDate(tx.created_at)} · {tx.reference}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{
                                    fontSize: '13px', fontWeight: '600', margin: '0 0 2px',
                                    color: tx.transaction_type === 'credit' ? '#10B981' : '#F43F5E',
                                }}>
                                    {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                                    {formatCurrency(tx.balance_after)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Request sheet */}
            {sheet === 'request' && (
                <Sheet onClose={() => setSheet(null)}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px', color: '#F1F5F9' }}>
                        Request money
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px', lineHeight: '1.6' }}>
                        Share your payment details with someone so they can send you money.
                    </p>
                    {currentAccount && (
                        <>
                            <DetailRow label="Full name" value={user?.full_name || ''} copyKey="req_name" />
                            <DetailRow label="Account number" value={currentAccount.account_number} copyKey="req_account" />
                            <DetailRow label="Sort code" value="40-47-84" copyKey="req_sort" />
                            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                                <button
                                    onClick={() => copyToClipboard(requestMessage, 'req_all')}
                                    style={{
                                        width: '100%',
                                        backgroundColor: copied === 'req_all' ? 'rgba(16,185,129,0.12)' : '#8B5CF6',
                                        border: copied === 'req_all' ? '1px solid #10B981' : 'none',
                                        color: copied === 'req_all' ? '#10B981' : '#F1F5F9',
                                        padding: '14px', borderRadius: '12px',
                                        fontSize: '15px', fontWeight: '600',
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px',
                                    }}>
                                    {copied === 'req_all' ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    {copied === 'req_all' ? 'Copied!' : 'Copy payment details'}
                                </button>
                            </div>
                        </>
                    )}
                    <button
                        onClick={() => setSheet(null)}
                        style={{
                            width: '100%', backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px', padding: '14px',
                            color: '#94A3B8', fontSize: '15px', fontWeight: '600',
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                        Close
                    </button>
                </Sheet>
            )}

            {/* Add money sheet */}
            {sheet === 'addmoney' && (
                <Sheet onClose={() => setSheet(null)}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px', color: '#F1F5F9' }}>
                        Add money
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px', lineHeight: '1.6' }}>
                        Transfer money into your Vaultline account from any UK bank using these details.
                    </p>
                    {currentAccount && (
                        <>
                            <DetailRow label="Account name" value={user?.full_name || ''} copyKey="add_name" />
                            <DetailRow label="Account number" value={currentAccount.account_number} copyKey="add_account" />
                            <DetailRow label="Sort code" value="40-47-84" copyKey="add_sort" />
                            <DetailRow label="Bank name" value="Vaultline" copyKey="add_bank" />
                            <div style={{
                                marginTop: '16px',
                                backgroundColor: 'rgba(139,92,246,0.08)',
                                border: '1px solid rgba(139,92,246,0.2)',
                                borderRadius: '12px', padding: '12px 14px',
                                marginBottom: '16px',
                            }}>
                                <p style={{ fontSize: '12px', color: '#A78BFA', margin: 0, lineHeight: '1.6' }}>
                                    Transfers from UK banks typically arrive within 2 hours. International transfers may take longer.
                                </p>
                            </div>
                        </>
                    )}
                    <button
                        onClick={() => setSheet(null)}
                        style={{
                            width: '100%', backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px', padding: '14px',
                            color: '#94A3B8', fontSize: '15px', fontWeight: '600',
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                        Done
                    </button>
                </Sheet>
            )}

            {/* More sheet */}
            {sheet === 'more' && (
                <Sheet onClose={() => setSheet(null)}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px', color: '#F1F5F9' }}>
                        More
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px' }}>
                        Quick access to all features
                    </p>
                    {[
                        { label: 'Transaction history', desc: 'View all your transactions', action: () => { setSheet(null); navigate('/dashboard/transactions'); } },
                        { label: 'Savings goals', desc: 'Track your savings progress', action: () => { setSheet(null); navigate('/dashboard/savings'); } },
                        { label: 'Settings', desc: 'Account and security settings', action: () => { setSheet(null); navigate('/dashboard/settings'); } },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={item.action}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#1a1d2e',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '12px', padding: '14px',
                                marginBottom: '8px', cursor: 'pointer',
                                fontFamily: 'inherit', textAlign: 'left' as const,
                            }}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: '#F1F5F9', margin: '0 0 2px' }}>{item.label}</p>
                                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{item.desc}</p>
                            </div>
                            <IconChevronRight size={16} color="#475569" />
                        </button>
                    ))}
                    <button
                        onClick={() => setSheet(null)}
                        style={{
                            width: '100%', backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px', padding: '14px',
                            color: '#94A3B8', fontSize: '15px', fontWeight: '600',
                            cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px',
                        }}>
                        Close
                    </button>
                </Sheet>
            )}
        </div>
    );
}