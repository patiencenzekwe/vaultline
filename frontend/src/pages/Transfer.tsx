import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { accountService, transferService } from '../services/api';
import type { Account } from '../types';
import { IconSend, IconShieldLock, IconChevronDown } from '@tabler/icons-react';

export default function Transfer() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        accountService.getAccounts().then((res) => {
            setAccounts(res.data.accounts);
            if (res.data.accounts.length > 0) {
                setFromAccount(res.data.accounts[0].id);
            }
        });
    }, []);

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(parseFloat(amount));
    };

    const selectedAccount = accounts.find((a) => a.id === fromAccount);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const res = await transferService.createTransfer({
                from_account_id: fromAccount,
                to_account_id: toAccount,
                amount: parseFloat(amount),
                description,
            });
            setSuccess(`Transfer completed. Reference: ${res.data.reference}`);
            setAmount('');
            setToAccount('');
            setDescription('');
            accountService.getAccounts().then((res) => setAccounts(res.data.accounts));
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setError(axiosError.response?.data?.error || 'Transfer failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        backgroundColor: '#1a1d2e',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '12px 14px',
        color: '#F1F5F9',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box' as const,
        fontFamily: 'inherit',
    };

    return (
        <div style={{ color: '#F1F5F9' }}>
            {/* Header */}
            <div style={{ padding: '16px 16px 10px' }}>
                <h1 style={{ fontSize: '17px', fontWeight: '600', margin: '0 0 4px' }}>Send money</h1>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                    Transfer funds between accounts
                </p>
            </div>

            {/* From account */}
            <div style={{ padding: '0 14px 12px' }}>
                <div style={{
                    backgroundColor: '#1a1d2e',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderTop: '2px solid #8B5CF6',
                    borderRadius: '16px',
                    padding: '14px',
                }}>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 8px' }}>From</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 2px' }}>
                                {selectedAccount ? formatCurrency(selectedAccount.balance) : '—'}
                            </p>
                            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, textTransform: 'capitalize' }}>
                                {selectedAccount?.account_type} account
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <select
                                value={fromAccount}
                                onChange={(e) => setFromAccount(e.target.value)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#A78BFA',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id} style={{ backgroundColor: '#141620' }}>
                                        {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <IconChevronDown size={12} color="#A78BFA" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '0 14px' }}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                        Recipient account ID
                    </label>
                    <input
                        type="text"
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                        required
                        placeholder="Paste account UUID"
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                        Amount
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: '14px', top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94A3B8', fontSize: '14px',
                        }}>£</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0.01"
                            max="10000"
                            step="0.01"
                            placeholder="0.00"
                            style={{ ...inputStyle, paddingLeft: '28px' }}
                        />
                    </div>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>
                        Maximum single transfer: £10,000
                    </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                        Description (optional)
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this for?"
                        style={inputStyle}
                    />
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(244,63,94,0.12)',
                        border: '1px solid #F43F5E',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        color: '#F43F5E',
                        fontSize: '13px',
                        marginBottom: '12px',
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: 'rgba(16,185,129,0.12)',
                        border: '1px solid #10B981',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        color: '#10B981',
                        fontSize: '13px',
                        marginBottom: '12px',
                    }}>
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        backgroundColor: loading ? '#6D44CC' : '#8B5CF6',
                        border: 'none',
                        color: '#F1F5F9',
                        padding: '14px',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}>
                    <IconSend size={16} />
                    {loading ? 'Processing...' : 'Send transfer'}
                </button>
            </form>

            {/* Security notice */}
            <div style={{
                margin: '0 14px',
                backgroundColor: '#1a1d2e',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
            }}>
                <IconShieldLock size={16} color="#8B5CF6" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: '1.6' }}>
                    Protected by Istio mutual TLS. Credentials managed by HashiCorp Vault. Every transfer is ACID-compliant with row-level locking.
                </p>
            </div>
        </div>
    );
}