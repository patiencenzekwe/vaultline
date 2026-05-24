import { IconPigMoney, IconTrendingUp, IconTarget } from '@tabler/icons-react';

export default function Savings() {
    const goals = [
        { name: 'Emergency fund', target: 3000, saved: 1200, color: '#8B5CF6' },
        { name: 'Holiday', target: 2000, saved: 650, color: '#10B981' },
        { name: 'New laptop', target: 1500, saved: 1500, color: '#60A5FA' },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(amount);
    };

    return (
        <div style={{ color: '#F1F5F9' }}>
            {/* Header */}
            <div style={{ padding: '16px 16px 0' }}>
                <h1 style={{ fontSize: '17px', fontWeight: '600', margin: 0 }}>Savings</h1>
            </div>

            {/* Total saved hero */}
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
                <p style={{ fontSize: '34px', fontWeight: '500', letterSpacing: '-1px', color: '#fff', margin: '0 0 8px', position: 'relative', zIndex: 1 }}>
                    £3,350.00
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconTrendingUp size={14} color="#6ee7b7" />
                    <span style={{ fontSize: '12px', color: '#6ee7b7' }}>+£120.00 interest this month</span>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
                    3.50% AER variable
                </p>
            </div>

            {/* Savings goals */}
            <div style={{ padding: '0 14px 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>Savings goals</span>
                    <button style={{
                        background: 'none', border: 'none', color: '#A78BFA',
                        fontSize: '11px', cursor: 'pointer', padding: 0,
                    }}>
                        Add goal
                    </button>
                </div>

                {goals.map((goal) => {
                    const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
                    const complete = goal.saved >= goal.target;
                    return (
                        <div key={goal.name} style={{
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
                                            {complete ? 'Goal reached!' : `${formatCurrency(goal.target - goal.saved)} to go`}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 2px', color: goal.color }}>
                                        {percent}%
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                                        {formatCurrency(goal.saved)}
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{
                                height: '4px', backgroundColor: 'rgba(255,255,255,0.08)',
                                borderRadius: '2px', overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '4px', width: `${percent}%`,
                                    backgroundColor: goal.color, borderRadius: '2px',
                                    transition: 'width 0.3s ease',
                                }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                                <span style={{ fontSize: '10px', color: '#475569' }}>
                                    {formatCurrency(goal.saved)} saved
                                </span>
                                <span style={{ fontSize: '10px', color: '#475569' }}>
                                    Target: {formatCurrency(goal.target)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}