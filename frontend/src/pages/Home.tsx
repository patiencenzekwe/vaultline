import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService } from '../services/api';
import type { Account, Transaction } from '../types';

export default function Home() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountsRes = await accountService.getAccounts();
                setAccounts(accountsRes.data.accounts);

                if (accountsRes.data.accounts.length > 0) {
                    const txRes = await transactionService.getTransactions(
                        accountsRes.data.accounts[0].id,
                        5
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

    const totalBalance = accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.balance),
        0
    );

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{ color: '#94A3B8' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>
                    Good morning, {user?.full_name?.split(' ')[0]}
                </h1>
                <p style={{ color: '#94A3B8', margin: 0 }}>Here is your financial overview</p>
            </div>

            {/* Total balance hero */}
            <div style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D44CC 100%)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '24px',
            }}>
                <p style={{ color: '#F1F5F9AA', fontSize: '14px', margin: '0 0 8px' }}>Total balance</p>
                <h2 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 8px' }}>
                    {formatCurrency(totalBalance)}
                </h2>
                <p style={{ color: '#F1F5F9AA', fontSize: '13px', margin: 0 }}>
                    Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Account cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
            }}>
                {accounts.map((account) => (
                    <div key={account.id} style={{
                        backgroundColor: '#141620',
                        border: '1px solid #1a1d2e',
                        borderRadius: '16px',
                        padding: '24px',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '24px',
                        }}>
                            <div>
                                <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 4px', textTransform: 'capitalize' }}>
                                    {account.account_type} account
                                </p>
                                <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0 }}>
                                    •••• {account.account_number.slice(-4)}
                                </p>
                            </div>
                            <div style={{
                                backgroundColor: '#8B5CF620',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '12px',
                                color: '#8B5CF6',
                            }}>
                                {account.currency}
                            </div>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                            {formatCurrency(account.balance)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent transactions */}
            <div style={{
                backgroundColor: '#141620',
                border: '1px solid #1a1d2e',
                borderRadius: '16px',
                padding: '24px',
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 20px' }}>
                    Recent transactions
                </h3>

                {transactions.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                        No transactions yet
                    </p>
                ) : (
                    <div>
                        {transactions.map((tx) => (
                            <div key={tx.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 0',
                                borderBottom: '1px solid #1a1d2e',
                            }}>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 4px' }}>
                                        {tx.description || tx.transaction_type}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                                        {formatDate(tx.created_at)} · {tx.reference}
                                    </p>
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
                                        Balance: {formatCurrency(tx.balance_after)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}