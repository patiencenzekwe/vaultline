import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(email, password, fullName);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
                    <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px' }}>Create your account</h1>
                    <p style={{ color: '#94A3B8', margin: 0, fontSize: '14px' }}>Start banking with Vaultline today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                            Full name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="James Harrison"
                            style={inputStyle}
                        />
                    </div>

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
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={inputStyle}
                        />
                    </div>

                    <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '28px' }}>
                        Min 8 characters, uppercase, number, and special character required.
                    </p>

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
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>

                    <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px', margin: 0 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: '600' }}>
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}