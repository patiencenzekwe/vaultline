import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { accountService, transferService } from '../services/api';
import type { Account } from '../types';

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
        backgroundColor: '#0D0F1A',
        border: '1px solid #1a1d2e',
        borderRadius: '10px',
        padding: '14px 16px',
        color: '#F1F5F9',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box' as const,
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>Transfer funds</h1>
                <p style={{ color: '#94A3B8', margin: 0 }}>Send money between accounts</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{
                    backgroundColor: '#141620',
                    border: '1px solid #1a1d2e',
                    borderRadius: '16px',
                    padding: '32px',
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                                From account
                            </label>
                            <select
                                value={fromAccount}
                                onChange={(e) => setFromAccount(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                            >
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id} style={{ backgroundColor: '#141620' }}>
                                        {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} — {formatCurrency(acc.balance)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                                To account ID
                            </label>
                            <input
                                type="text"
                                value={toAccount}
                                onChange={(e) => setToAccount(e.target.value)}
                                required
                                placeholder="Recipient account UUID"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                                Amount (GBP)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94A3B8',
                                    fontSize: '15px',
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
                                    style={{ ...inputStyle, paddingLeft: '32px' }}
                                />
                            </div>
                            <p style={{ fontSize: '12px', color: '#94A3B8', margin: '6px 0 0' }}>
                                Maximum single transfer: £10,000
                            </p>
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                                Description (optional)
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this transfer for?"
                                style={inputStyle}
                            />
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: '#F43F5E20',
                                border: '1px solid #F43F5E',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                color: '#F43F5E',
                                fontSize: '14px',
                                marginBottom: '20px',
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                backgroundColor: '#10B98120',
                                border: '1px solid #10B981',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                color: '#10B981',
                                fontSize: '14px',
                                marginBottom: '20px',
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
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}>
                            {loading ? 'Processing...' : 'Send transfer'}
                        </button>
                    </form>
                </div>

                <div>
                    <div style={{
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '16px',
                    }}>
                        <h3 style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 16px', fontWeight: '400' }}>
                            Selected account balance
                        </h3>
                        <p style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 8px' }}>
                            {selectedAccount ? formatCurrency(selectedAccount.balance) : '—'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, textTransform: 'capitalize' }}>
                            {selectedAccount?.account_type} account
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '16px',
                        padding: '24px',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>
                            Security notice
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.7', margin: 0 }}>
                            All transfers are protected by Istio mutual TLS. Database credentials are dynamically generated by HashiCorp Vault and rotated automatically. Every transaction uses PostgreSQL ACID compliance with row-level locking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}