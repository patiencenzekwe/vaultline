import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { accountService, transferService, beneficiaryService } from '../services/api';
import type { Account, Beneficiary } from '../types';
import {
    IconSend,
    IconShieldLock,
    IconChevronDown,
    IconUserPlus,
    IconTrash,
    IconUser,
    IconX,
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

export default function Transfer() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [fromAccount, setFromAccount] = useState('');
    const [toAccountNumber, setToAccountNumber] = useState('');
    const [toSortCode, setToSortCode] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastTransfer, setLastTransfer] = useState<{
        toAccountId: string;
        toAccountNumber: string;
    } | null>(null);

    const [sheet, setSheet] = useState<'beneficiaries' | 'save' | null>(null);
    const [saveName, setSaveName] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    useEffect(() => {
        accountService.getAccounts().then((res) => {
            setAccounts(res.data.accounts);
            if (res.data.accounts.length > 0) {
                setFromAccount(res.data.accounts[0].id);
            }
        });
        fetchBeneficiaries();
    }, []);

    const fetchBeneficiaries = async () => {
        try {
            const res = await beneficiaryService.getBeneficiaries();
            setBeneficiaries(res.data.beneficiaries);
        } catch {
            setBeneficiaries([]);
        }
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(parseFloat(amount));
    };

    const formatSortCode = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 6);
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
        return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
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
                to_account_number: toAccountNumber,
                to_sort_code: toSortCode,
                amount: parseFloat(amount),
                description,
            });
            setSuccess(`Transfer completed. Reference: ${res.data.reference}`);
            setLastTransfer({
                toAccountId: res.data.to_account_id,
                toAccountNumber: res.data.to_account_number,
            });
            setAmount('');
            setDescription('');
            accountService.getAccounts().then((res) => setAccounts(res.data.accounts));
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setError(axiosError.response?.data?.error || 'Transfer failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBeneficiary = (b: Beneficiary) => {
        setToAccountNumber(b.account_number);
        setToSortCode('40-47-84');
        setError(null);
        setSheet(null);
    };

    const handleDeleteBeneficiary = async (id: string) => {
        try {
            await beneficiaryService.deleteBeneficiary(id);
            fetchBeneficiaries();
        } catch {
            // silent fail
        }
    };

    const handleSaveBeneficiary = async () => {
        if (!lastTransfer) return;
        setSaveLoading(true);
        setSaveError('');
        setSaveSuccess('');
        try {
            await beneficiaryService.createBeneficiary({
                name: saveName,
                account_number: lastTransfer.toAccountNumber,
                account_id: lastTransfer.toAccountId,
            });
            setSaveSuccess('Payee saved successfully.');
            setSaveName('');
            fetchBeneficiaries();
            setTimeout(() => setSheet(null), 1500);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setSaveError(axiosError.response?.data?.error || 'Failed to save payee.');
        } finally {
            setSaveLoading(false);
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
                    Transfer funds to another account
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
                                    background: 'none', border: 'none', color: '#A78BFA',
                                    fontSize: '11px', cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                                }}>
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

            {/* Saved payees */}
            {beneficiaries.length > 0 && (
                <div style={{ padding: '0 14px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>Saved payees</span>
                        <button
                            onClick={() => setSheet('beneficiaries')}
                            style={{ background: 'none', border: 'none', color: '#A78BFA', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                            Manage
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                        {beneficiaries.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => handleSelectBeneficiary(b)}
                                style={{
                                    flexShrink: 0,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
                                }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    backgroundColor: toAccountNumber === b.account_number ? '#8B5CF6' : '#1a1d2e',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#F1F5F9', fontWeight: '700', fontSize: '14px',
                                }}>
                                    {b.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                                    {b.name.split(' ')[0]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '0 14px' }}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                        Account number
                    </label>
                    <input
                        type="text"
                        value={toAccountNumber}
                        onChange={(e) => setToAccountNumber(e.target.value)}
                        required
                        placeholder="e.g. GB17779629449714"
                        maxLength={20}
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                        Sort code
                    </label>
                    <input
                        type="text"
                        value={toSortCode}
                        onChange={(e) => setToSortCode(formatSortCode(e.target.value))}
                        required
                        placeholder="40-47-84"
                        maxLength={8}
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
                            transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '14px',
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
                        backgroundColor: 'rgba(244,63,94,0.12)', border: '1px solid #F43F5E',
                        borderRadius: '12px', padding: '12px 14px',
                        color: '#F43F5E', fontSize: '13px', marginBottom: '12px',
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{
                            backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid #10B981',
                            borderRadius: '12px', padding: '12px 14px',
                            color: '#10B981', fontSize: '13px', marginBottom: '8px',
                        }}>
                            {success}
                        </div>
                        <button
                            type="button"
                            onClick={() => setSheet('save')}
                            style={{
                                width: '100%', backgroundColor: 'transparent',
                                border: '1px solid rgba(139,92,246,0.4)',
                                borderRadius: '12px', padding: '10px',
                                color: '#A78BFA', fontSize: '13px', fontWeight: '500',
                                cursor: 'pointer', fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            }}>
                            <IconUserPlus size={14} />
                            Save as payee
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        backgroundColor: loading ? '#6D44CC' : '#8B5CF6',
                        border: 'none', color: '#F1F5F9', padding: '14px',
                        borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        marginBottom: '16px', fontFamily: 'inherit',
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
                borderRadius: '14px', padding: '14px',
                display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
                <IconShieldLock size={16} color="#8B5CF6" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: '1.6' }}>
                    Protected by Istio mutual TLS. Credentials managed by HashiCorp Vault. Every transfer is ACID-compliant with row-level locking.
                </p>
            </div>

            {/* Manage beneficiaries sheet */}
            {sheet === 'beneficiaries' && (
                <Sheet onClose={() => setSheet(null)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>Saved payees</h2>
                        <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    {beneficiaries.length === 0 ? (
                        <p style={{ color: '#94A3B8', textAlign: 'center', padding: '24px 0' }}>No saved payees yet</p>
                    ) : (
                        beneficiaries.map((b) => (
                            <div key={b.id} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: 'rgba(139,92,246,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#A78BFA', fontWeight: '700', flexShrink: 0, fontSize: '14px',
                                }}>
                                    {b.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px', color: '#F1F5F9' }}>{b.name}</p>
                                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, fontFamily: 'monospace' }}>
                                        {b.account_number} · 40-47-84
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleSelectBeneficiary(b)}
                                        style={{
                                            backgroundColor: '#8B5CF6', border: 'none',
                                            borderRadius: '8px', padding: '6px 12px',
                                            color: '#F1F5F9', fontSize: '11px', fontWeight: '600',
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                        }}>
                                        <IconUser size={12} /> Select
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBeneficiary(b.id)}
                                        style={{
                                            backgroundColor: 'rgba(244,63,94,0.12)', border: 'none',
                                            borderRadius: '8px', padding: '6px 10px',
                                            color: '#F43F5E', cursor: 'pointer',
                                        }}>
                                        <IconTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </Sheet>
            )}

            {/* Save payee sheet */}
            {sheet === 'save' && (
                <Sheet onClose={() => setSheet(null)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>Save payee</h2>
                        <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px' }}>
                        Save this recipient so you can send money to them quickly next time.
                    </p>
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        Payee name
                    </label>
                    <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="e.g. Sarah Mitchell"
                        style={{
                            width: '100%',
                            backgroundColor: '#0D0F1A',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px', padding: '12px 14px',
                            color: '#F1F5F9', fontSize: '14px', outline: 'none',
                            boxSizing: 'border-box' as const, fontFamily: 'inherit',
                            marginBottom: '16px',
                        }}
                    />
                    {saveError && (
                        <div style={{
                            backgroundColor: 'rgba(244,63,94,0.12)', border: '1px solid #F43F5E',
                            borderRadius: '10px', padding: '10px 14px',
                            color: '#F43F5E', fontSize: '13px', marginBottom: '12px',
                        }}>
                            {saveError}
                        </div>
                    )}
                    {saveSuccess && (
                        <div style={{
                            backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid #10B981',
                            borderRadius: '10px', padding: '10px 14px',
                            color: '#10B981', fontSize: '13px', marginBottom: '12px',
                        }}>
                            {saveSuccess}
                        </div>
                    )}
                    <button
                        onClick={handleSaveBeneficiary}
                        disabled={saveLoading || !saveName}
                        style={{
                            width: '100%',
                            backgroundColor: saveLoading || !saveName ? '#6D44CC' : '#8B5CF6',
                            border: 'none', color: '#F1F5F9', padding: '14px',
                            borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                            cursor: saveLoading || !saveName ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                        }}>
                        {saveLoading ? 'Saving...' : 'Save payee'}
                    </button>
                </Sheet>
            )}
        </div>
    );
}