import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            setError(axiosError.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: '#0D0F1A',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F1F5F9',
        }}>
            <div style={{
                backgroundColor: '#141620',
                border: '1px solid #1a1d2e',
                borderRadius: '20px',
                padding: '48px',
                width: '100%',
                maxWidth: '440px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#8B5CF6',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '24px',
                        margin: '0 auto 16px',
                    }}>V</div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px' }}>Welcome back</h1>
                    <p style={{ color: '#94A3B8', margin: 0, fontSize: '14px' }}>Sign in to your Vaultline account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                            Email address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                backgroundColor: '#0D0F1A',
                                border: '1px solid #1a1d2e',
                                borderRadius: '10px',
                                padding: '14px 16px',
                                color: '#F1F5F9',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box' as const,
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#0D0F1A',
                                    border: '1px solid #1a1d2e',
                                    borderRadius: '10px',
                                    padding: '14px 48px 14px 16px',
                                    color: '#F1F5F9',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxSizing: 'border-box' as const,
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    padding: 0,
                                }}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
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
                            marginBottom: '24px',
                        }}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px', margin: 0 }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: '600' }}>
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}