import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import '../styles/login-register.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const from = location.state?.from || '/';

    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (touched[name] && !value) {
            setErrors((prev) => ({ ...prev, [name]: `${name === 'username' ? 'Username' : 'Password'} is required` }));
        } else if (touched[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        if (!value) {
            setErrors((prev) => ({
                ...prev,
                [name]: `${name === 'username' ? 'Username' : 'Password'} is required`,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        const next = {};
        if (!form.username) next.username = 'Username is required';
        if (!form.password) next.password = 'Password is required';
        if (Object.keys(next).length) {
            setErrors(next);
            setTouched({ username: true, password: true });
            return;
        }

        setSubmitting(true);
        try {
            await login(form.username, form.password);
            navigate(from, { replace: true });
        } catch (err) {
            setServerError(err.message || 'Invalid username or password');
        } finally {
            setSubmitting(false);
        }
    };

    const hasErrors = Object.values(errors).some(Boolean);
    const missingRequired = !form.username || !form.password;
    const submitDisabled = submitting || hasErrors || missingRequired;

    return (
        <div className="auth-page">
            <Link to="/" className="auth-back-home btn btn-secondary">← Keep browsing</Link>
            <ThemeToggle className="auth-theme-toggle btn btn-secondary" />
            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <Link to="/" className="auth-brand">AdvancedWolt</Link>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to keep ordering from places you love.</p>

                {serverError && <div className="auth-server-error">{serverError}</div>}

                <div className={`auth-field ${touched.username && errors.username ? 'auth-field--error' : ''}`}>
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        value={form.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your username"
                    />
                    {touched.username && errors.username && (
                        <span className="auth-field-error">{errors.username}</span>
                    )}
                </div>

                <div className={`auth-field ${touched.password && errors.password ? 'auth-field--error' : ''}`}>
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your password"
                    />
                    {touched.password && errors.password && (
                        <span className="auth-field-error">{errors.password}</span>
                    )}
                </div>

                <button className="auth-submit" type="submit" disabled={submitDisabled}>
                    {submitting ? 'Logging in…' : 'Log in'}
                </button>

                <p className="auth-footer">
                    Don&apos;t have an account? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
