import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { IconPigMoney, IconTrendingUp, IconTarget, IconPlus, IconX, IconTrash } from '@tabler/icons-react';
import api from '../services/api';

interface SavingsGoal {
    id: string;
    name: string;
    target_amount: string;
    saved_amount: string;
    color: string;
    created_at: string;
}

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

export default function Savings() {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [sheet, setSheet] = useState<'add' | 'deposit' | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [goalColor, setGoalColor] = useState('#8B5CF6');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    const [depositAmount, setDepositAmount] = useState('');
    const [depositLoading, setDepositLoading] = useState(false);
    const [depositError, setDepositError] = useState('');

    const colors = ['#8B5CF6', '#10B981', '#60A5FA', '#F59E0B', '#F43F5E', '#EC4899'];

    const fetchGoals = async () => {
        try {
            const res = await api.get('/api/savings');
            setGoals(res.data.goals);
        } catch (err) {
            console.error('Failed to load savings goals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const totalSaved = goals.reduce(
        (sum, g) => sum + parseFloat(g.saved_amount), 0
    );

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const closeSheet = () => {
        setSheet(null);
        setSelectedGoal(null);
    };

    const handleAddGoal = async (e: FormEvent) => {
        e.preventDefault();
        setAddError('');
        setAddLoading(true);
        try {
            await api.post('/api/savings', {
                name: goalName,
                target_amount: parseFloat(targetAmount),
                color: goalColor,
            });
            setGoalName('');
            setTargetAmount('');
            setGoalColor('#8B5CF6');
            setSheet(null);
            fetchGoals();
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setAddError(axiosError.response?.data?.error || 'Failed to create goal.');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeposit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedGoal) return;
        setDepositError('');
        setDepositLoading(true);
        try {
            const newAmount = parseFloat(selectedGoal.saved_amount) + parseFloat(depositAmount);
            await api.put(`/api/savings/${selectedGoal.id}`, {
                saved_amount: newAmount,
            });
            setDepositAmount('');
            setSheet(null);
            setSelectedGoal(null);
            fetchGoals();
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setDepositError(axiosError.response?.data?.error || 'Failed to update goal.');
        } finally {
            setDepositLoading(false);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        try {
            await api.delete(`/api/savings/${id}`);
            fetchGoals();
        } catch (err) {
            console.error('Failed to delete goal:', err);
        }
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
        marginBottom: '12px',
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ color: '#F1F5F9' }}>
            <div style={{ padding: '16px 16px 0' }}>
                <h1 style={{ fontSize: '17px', fontWeight: '600', margin: 0 }}>Savings</h1>
            </div>

            {/* Hero */}
            <div style={{
                margin: '14px 14px 16px',
                borderRadius: '22px',
                padding: '20px',
                background: 'linear-gradient(135deg, #1a1040 0%, #2d1b69 60%, #1a1040 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: '-40px', right: '-20px',
                    width: '130px', height: '130px', borderRadius: '50%',
                    background: 'rgba(139,92,246,0.18)',
                }} />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', letterSpacing: '0.5px' }}>
                    TOTAL SAVED
                </p>
                <p style={{
                    fontSize: '34px', fontWeight: '500', letterSpacing: '-1px',
                    color: '#fff', margin: '0 0 8px', position: 'relative', zIndex: 1,
                }}>
                    {formatCurrency(totalSaved)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconTrendingUp size={14} color="#6ee7b7" />
                    <span style={{ fontSize: '12px', color: '#6ee7b7' }}>
                        {goals.length} active goal{goals.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
                    3.50% AER variable
                </p>
            </div>

            {/* Goals header */}
            <div style={{ padding: '0 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Savings goals</span>
                <button
                    onClick={() => setSheet('add')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', color: '#A78BFA',
                        fontSize: '11px', cursor: 'pointer', padding: 0,
                    }}>
                    <IconPlus size={12} /> Add goal
                </button>
            </div>

            {/* Goals list */}
            {goals.length === 0 ? (
                <div style={{
                    margin: '0 14px',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px',
                    padding: '32px',
                    textAlign: 'center',
                }}>
                    <IconPigMoney size={32} color="#475569" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 4px' }}>No savings goals yet</p>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>Tap Add goal to get started</p>
                </div>
            ) : (
                <div style={{ padding: '0 14px' }}>
                    {goals.map((goal) => {
                        const target = parseFloat(goal.target_amount);
                        const saved = parseFloat(goal.saved_amount);
                        const percent = Math.min(100, Math.round((saved / target) * 100));
                        const complete = saved >= target;

                        return (
                            <div key={goal.id} style={{
                                backgroundColor: '#1a1d2e',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '16px',
                                padding: '16px',
                                marginBottom: '10px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            backgroundColor: `${goal.color}20`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {complete
                                                ? <IconTarget size={18} color={goal.color} />
                                                : <IconPigMoney size={18} color={goal.color} />
                                            }
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px' }}>{goal.name}</p>
                                            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                                                {complete ? 'Goal reached!' : `${formatCurrency(target - saved)} to go`}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 2px', color: goal.color }}>
                                                {percent}%
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                                                {formatCurrency(saved)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            style={{
                                                background: 'none', border: 'none',
                                                color: '#475569', cursor: 'pointer', padding: '4px',
                                            }}>
                                            <IconTrash size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    height: '4px', backgroundColor: 'rgba(255,255,255,0.08)',
                                    borderRadius: '2px', overflow: 'hidden', marginBottom: '6px',
                                }}>
                                    <div style={{
                                        height: '4px', width: `${percent}%`,
                                        backgroundColor: goal.color, borderRadius: '2px',
                                    }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', color: '#475569' }}>
                                        {formatCurrency(saved)} of {formatCurrency(target)}
                                    </span>
                                    {!complete && (
                                        <button
                                            onClick={() => { setSelectedGoal(goal); setSheet('deposit'); }}
                                            style={{
                                                backgroundColor: `${goal.color}20`,
                                                border: 'none', borderRadius: '8px',
                                                padding: '4px 10px', color: goal.color,
                                                fontSize: '11px', fontWeight: '600',
                                                cursor: 'pointer', fontFamily: 'inherit',
                                            }}>
                                            Add funds
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add goal sheet */}
            {sheet === 'add' && (
                <Sheet onClose={closeSheet}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>New savings goal</h2>
                        <button onClick={closeSheet} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleAddGoal}>
                        <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Goal name</label>
                        <input
                            type="text"
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                            placeholder="e.g. Emergency fund"
                            required
                            style={inputStyle}
                        />
                        <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Target amount</label>
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <span style={{
                                position: 'absolute', left: '14px', top: '50%',
                                transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '14px',
                            }}>£</span>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                min="1"
                                step="0.01"
                                style={{ ...inputStyle, paddingLeft: '28px', marginBottom: 0 }}
                            />
                        </div>
                        <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>Colour</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setGoalColor(color)}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        backgroundColor: color,
                                        border: goalColor === color ? '3px solid white' : '3px solid transparent',
                                        cursor: 'pointer', padding: 0,
                                    }}
                                />
                            ))}
                        </div>
                        {addError && (
                            <div style={{
                                backgroundColor: 'rgba(244,63,94,0.12)', border: '1px solid #F43F5E',
                                borderRadius: '10px', padding: '10px 14px',
                                color: '#F43F5E', fontSize: '13px', marginBottom: '12px',
                            }}>
                                {addError}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={addLoading}
                            style={{
                                width: '100%', backgroundColor: addLoading ? '#6D44CC' : '#8B5CF6',
                                border: 'none', color: '#F1F5F9', padding: '14px',
                                borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                                cursor: addLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                            }}>
                            {addLoading ? 'Creating...' : 'Create goal'}
                        </button>
                    </form>
                </Sheet>
            )}

            {/* Deposit sheet */}
            {sheet === 'deposit' && selectedGoal && (
                <Sheet onClose={closeSheet}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#F1F5F9' }}>Add funds</h2>
                        <button onClick={closeSheet} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                            <IconX size={20} />
                        </button>
                    </div>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px' }}>
                        Adding to: <strong style={{ color: '#F1F5F9' }}>{selectedGoal.name}</strong>
                    </p>
                    <form onSubmit={handleDeposit}>
                        <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Amount to add</label>
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <span style={{
                                position: 'absolute', left: '14px', top: '50%',
                                transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '14px',
                            }}>£</span>
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                min="0.01"
                                step="0.01"
                                style={{ ...inputStyle, paddingLeft: '28px', marginBottom: 0 }}
                            />
                        </div>
                        {depositError && (
                            <div style={{
                                backgroundColor: 'rgba(244,63,94,0.12)', border: '1px solid #F43F5E',
                                borderRadius: '10px', padding: '10px 14px',
                                color: '#F43F5E', fontSize: '13px', marginBottom: '12px',
                            }}>
                                {depositError}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={depositLoading}
                            style={{
                                width: '100%',
                                backgroundColor: depositLoading ? '#6D44CC' : selectedGoal.color,
                                border: 'none', color: '#F1F5F9', padding: '14px',
                                borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                                cursor: depositLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                            }}>
                            {depositLoading ? 'Adding...' : 'Add funds'}
                        </button>
                    </form>
                </Sheet>
            )}
        </div>
    );
}