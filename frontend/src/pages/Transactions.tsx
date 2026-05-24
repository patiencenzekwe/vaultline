import { useState, useEffect } from 'react';
import { accountService, transactionService } from '../services/api';
import type { Account, Transaction } from '../types';
import { IconArrowUpRight, IconArrowDownLeft, IconSearch } from '@tabler/icons-react';

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

    const groupByMonth = (txs: Transaction[]) => {
        const groups: Record<string, Transaction[]> = {};
        txs.forEach((tx) => {
            const month = new Date(tx.created_at).toLocaleDateString('en-GB', {
                month: 'long',
                year: 'numeric',
            });
            if (!groups[month]) groups[month] = [];
            groups[month].push(tx);
        });
        return groups;
    };

    const filtered = transactions.filter((tx) =>
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.reference?.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = groupByMonth(filtered);

    return (
        <div style={{ color: '#F1F5F9' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 16px 10px',
            }}>
                <h1 style={{ fontSize: '17px', fontWeight: '600', margin: 0 }}>Transactions</h1>
                <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    style={{
                        backgroundColor: '#1a1d2e',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '20px',
                        padding: '5px 10px',
                        color: '#94A3B8',
                        fontSize: '11px',
                        outline: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id} style={{ backgroundColor: '#141620' }}>
                            {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Search */}
            <div style={{ padding: '0 14px 12px', position: 'relative' }}>
                <IconSearch size={14} color="#94A3B8" style={{
                    position: 'absolute', left: '26px', top: '50%',
                    transform: 'translateY(-50%)',
                }} />
                <input
                    type="text"
                    placeholder="Search your transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px 10px 34px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: '#1a1d2e',
                        color: '#F1F5F9',
                        outline: 'none',
                        boxSizing: 'border-box' as const,
                    }}
                />
            </div>

            {/* Grouped transactions */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
                    Loading transactions...
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
                    No transactions found
                </div>
            ) : (
                Object.entries(grouped).map(([month, txs]) => (
                    <div key={month}>
                        <div style={{
                            padding: '0 14px 6px',
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#475569',
                        }}>
                            {month}
                        </div>
                        <div style={{ padding: '0 14px' }}>
                            {txs.map((tx) => (
                                <div key={tx.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '11px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                                }}>
                                    <div style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '12px',
                                        backgroundColor: tx.transaction_type === 'credit'
                                            ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
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
                                            {formatDate(tx.created_at)} · Ref: {tx.reference}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            margin: '0 0 2px',
                                            color: tx.transaction_type === 'credit' ? '#10B981' : '#F43F5E',
                                        }}>
                                            {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                                            {formatCurrency(tx.balance_after)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}