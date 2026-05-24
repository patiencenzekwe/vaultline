import { useState, useEffect } from 'react';
import { accountService, transactionService } from '../services/api';
import type { Account, Transaction } from '../types';

export default function Transactions() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        accountService.getAccounts().then((res) => {
            setAccounts(res.data.accounts);
            if (res.data.accounts.length > 0) {
                setSelectedAccount(res.data.accounts[0].id);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedAccount) return;
        setLoading(true);
        transactionService.getTransactions(selectedAccount, 50)
            .then((res) => setTransactions(res.data.transactions))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedAccount]);

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filtered = transactions.filter((tx) =>
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.reference?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>Transactions</h1>
                <p style={{ color: '#94A3B8', margin: 0 }}>Your complete transaction history</p>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
            }}>
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: '#F1F5F9',
                        fontSize: '14px',
                        outline: 'none',
                    }}
                />
                <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    style={{
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: '#F1F5F9',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id} style={{ backgroundColor: '#141620' }}>
                            {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} account
                        </option>
                    ))}
                </select>
            </div>

            {/* Transactions list */}
            <div style={{
                backgroundColor: '#141620',
                border: '1px solid #1a1d2e',
                borderRadius: '16px',
                overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
                        Loading transactions...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
                        No transactions found
                    </div>
                ) : (
                    filtered.map((tx, index) => (
                        <div key={tx.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: index < filtered.length - 1 ? '1px solid #1a1d2e' : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: tx.transaction_type === 'credit' ? '#10B98120' : '#F43F5E20',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    flexShrink: 0,
                                }}>
                                    {tx.transaction_type === 'credit' ? '↓' : '↑'}
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 4px' }}>
                                        {tx.description || tx.transaction_type}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                                        {formatDate(tx.created_at)} · Ref: {tx.reference}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    margin: '0 0 4px',
                                    color: tx.transaction_type === 'credit' ? '#10B981' : '#F43F5E',
                                }}>
                                    {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                                    {formatCurrency(tx.balance_after)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}