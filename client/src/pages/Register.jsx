import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { readImageFile } from '../utils/image.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import '../styles/login-register.css';

const validators = {
    username: (v) => {
        if (!v) return 'Username is required';
        if (v.length < 3) return 'Username must be at least 3 characters';
        return '';
    },
    password: (v) => {
        if (!v) return 'Password is required';
        if (v.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-zA-Z]/.test(v)) return 'Password must contain at least one letter';
        if (!/\d/.test(v)) return 'Password must contain at least one digit';
        return '';
    },
    confirmPassword: (v, form) => {
        if (!v) return 'Please confirm your password';
        if (v !== form.password) return 'Passwords do not match';
        return '';
    },
    displayName: (v) => {
        if (!v) return 'Display name is required';
        return '';
    },
    locationX: (v) => {
        if (v === '' || v === undefined || isNaN(v)) return 'Valid X coordinate is required';
        return '';
    },
    locationY: (v) => {
        if (v === '' || v === undefined || isNaN(v)) return 'Valid Y coordinate is required';
        return '';
    },
};

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        locationX: '',
        locationY: '',
        role: 'customer',
    });
    const [imageData, setImageData] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next = { ...form, [name]: value };
        setForm(next);

        if (touched[name]) {
            const validator = validators[name];
            setErrors((prev) => ({
                ...prev,
                [name]: validator ? validator(value, next) : '',
            }));
        }

        if (name === 'password' && touched.confirmPassword) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: validators.confirmPassword(next.confirmPassword, next),
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const validator = validators[name];
        if (validator) {
            setErrors((prev) => ({ ...prev, [name]: validator(value, form) }));
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImageData(null);
        setErrors((prev) => ({ ...prev, image: '' }));
        fileInputRef.current.value = '';
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64 = await readImageFile(file);
            setErrors((prev) => ({ ...prev, image: '' }));
            setImageData(base64);
        } catch (err) {
            setErrors((prev) => ({ ...prev, image: err.message }));
        }
    };

    const allFieldsValid = () => {
        const fieldErrors = {};
        for (const key of Object.keys(validators)) {
            fieldErrors[key] = validators[key](form[key], form);
        }

        setErrors(fieldErrors);

        const allTouched = Object.keys(form).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, { displayName: true });
        setTouched(allTouched);

        return Object.values(fieldErrors).every((msg) => !msg);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!allFieldsValid()) return;

        setSubmitting(true);
        try {
            await register({
                username: form.username,
                password: form.password,
                displayName: form.displayName,
                image: imageData,
                role: form.role,
                location: {
                    x: parseFloat(form.locationX),
                    y: parseFloat(form.locationY)
                },
            });
            navigate('/login');
        } catch (err) {
            setServerError(err.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const hasErrors = Object.values(errors).some(Boolean);
    const missingRequired =
        form.username === '' || form.password === '' || form.confirmPassword === '' || form.displayName === '' || form.locationX === '' || form.locationY === '';
    const submitDisabled = submitting || hasErrors || missingRequired;

    return (
        <div className="auth-page">
            <ThemeToggle className="auth-theme-toggle btn btn-secondary" />
            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <Link to="/" className="auth-brand">AdvancedWolt</Link>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Set up your profile to start ordering.</p>

                {serverError && <div className="auth-server-error">{serverError}</div>}

                <fieldset className="auth-role-picker">
                    <legend>Account type</legend>
                    <label className={form.role === 'customer' ? 'auth-role-option auth-role-option--active' : 'auth-role-option'}>
                        <input
                            type="radio"
                            name="role"
                            value="customer"
                            checked={form.role === 'customer'}
                            onChange={handleChange}
                        />
                        <span className="auth-role-icon" aria-hidden="true">🛍️</span>
                        <span>
                            <strong>Customer</strong>
                            <small>Browse and order food</small>
                        </span>
                    </label>
                    <label className={form.role === 'restaurant_owner' ? 'auth-role-option auth-role-option--active' : 'auth-role-option'}>
                        <input
                            type="radio"
                            name="role"
                            value="restaurant_owner"
                            checked={form.role === 'restaurant_owner'}
                            onChange={handleChange}
                        />
                        <span className="auth-role-icon" aria-hidden="true">🍽️</span>
                        <span>
                            <strong>Restaurant owner</strong>
                            <small>Create and manage restaurants</small>
                        </span>
                    </label>
                </fieldset>

                {/* --- Image picker --- */}
                <div className="auth-image-picker" onClick={handleImageClick}>
                    {imageData ? (
                        <img
                            src={imageData}
                            alt="Profile preview"
                            className="auth-image-preview"
                        />
                    ) : (
                        <div className="auth-image-placeholder">
                            <span className="auth-image-icon">📷</span>
                            <span>Add photo</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="auth-file-input"
                    />
                </div>
                <div className="auth-image-meta">
                    {imageData && (
                        <button
                            type="button"
                            className="auth-remove-image"
                            onClick={handleRemoveImage}
                        >
                            ✕ Remove photo
                        </button>
                    )}
                    <span className="auth-image-hint">Optional · Max 5MB</span>
                </div>
                {errors.image && (
                    <span className="auth-field-error auth-image-error">{errors.image}</span>
                )}

                {/* --- Fields --- */}
                <div className={`auth-field ${touched.username && errors.username ? 'auth-field--error' : ''}`}>
                    <label htmlFor="reg-username">Username</label>
                    <input
                        id="reg-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        value={form.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Choose a username"
                    />
                    {touched.username && errors.username && (
                        <span className="auth-field-error">{errors.username}</span>
                    )}
                </div>

                <div className={`auth-field ${touched.displayName && errors.displayName ? 'auth-field--error' : ''}`}>
                    <label htmlFor="reg-displayName">Display name</label>
                    <input
                        id="reg-displayName"
                        name="displayName"
                        type="text"
                        value={form.displayName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="How should we call you?"
                    />
                    {touched.displayName && errors.displayName && (
                        <span className="auth-field-error">{errors.displayName}</span>
                    )}
                </div>

                <div className={`auth-field ${touched.locationX && errors.locationX ? 'auth-field--error' : ''}`}>
                    <label htmlFor="reg-locationX">Location X (Latitude)</label>
                    <input
                        id="reg-locationX"
                        name="locationX"
                        type="number"
                        step="any"
                        value={form.locationX}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 32.0853"
                    />
                    {touched.locationX && errors.locationX && (
                        <span className="auth-field-error">{errors.locationX}</span>
                    )}
                </div>

                <div className={`auth-field ${touched.locationY && errors.locationY ? 'auth-field--error' : ''}`}>
                    <label htmlFor="reg-locationY">Location Y (Longitude)</label>
                    <input
                        id="reg-locationY"
                        name="locationY"
                        type="number"
                        step="any"
                        value={form.locationY}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 34.7818"
                    />
                    {touched.locationY && errors.locationY && (
                        <span className="auth-field-error">{errors.locationY}</span>
                    )}
                </div>

                <div className={`auth-field ${touched.password && errors.password ? 'auth-field--error' : ''}`}>
                    <label htmlFor="reg-password">Password</label>
                    <input
                        id="reg-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Min 8 chars, letters & digits"
                    />
                    {touched.password && errors.password && (
                        <span className="auth-field-error">{errors.password}</span>
                    )}
                </div>

                <div
                    className={`auth-field ${
                        touched.confirmPassword && errors.confirmPassword ? 'auth-field--error' : ''
                    }`}
                >
                    <label htmlFor="reg-confirmPassword">Confirm password</label>
                    <input
                        id="reg-confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Re-enter your password"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                        <span className="auth-field-error">{errors.confirmPassword}</span>
                    )}
                </div>

                <button className="auth-submit" type="submit" disabled={submitDisabled}>
                    {submitting ? 'Creating account…' : 'Register'}
                </button>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
