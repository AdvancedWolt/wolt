import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useImagePicker } from '../hooks/useImagePicker.js';
import {
    validateUsername,
    validatePassword,
    validateConfirmPassword,
    validateDisplayName,
    validateCoordinate,
} from '../utils/validators.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import '../styles/login-register.css';

const validators = {
    username: validateUsername,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
    displayName: validateDisplayName,
    locationX: (value) => validateCoordinate(value, 'Latitude'),
    locationY: (value) => validateCoordinate(value, 'Longitude'),
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
    const image = useImagePicker();
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        image.remove();
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
        }, {});
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
                image: image.imageData,
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
    const submitDisabled = submitting || hasErrors || missingRequired || Boolean(image.error);

    return (
        <div className="auth-page">
            <Link to="/" className="auth-back-home btn btn-secondary">← Keep browsing</Link>
            <ThemeToggle className="auth-theme-toggle btn btn-secondary" />
            <form className="auth-card auth-card--wide" onSubmit={handleSubmit} noValidate>
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
                <div className="auth-image-picker" onClick={image.open}>
                    {image.imageData ? (
                        <img
                            src={image.imageData}
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
                        ref={image.inputRef}
                        type="file"
                        accept="image/*"
                        onChange={image.onChange}
                        className="auth-file-input"
                    />
                </div>
                <div className="auth-image-meta">
                    {image.imageData && (
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
                {image.error && (
                    <span className="auth-field-error auth-image-error">{image.error}</span>
                )}

                <div className="auth-row">
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
                            placeholder="Shown to others"
                        />
                        {touched.displayName && errors.displayName && (
                            <span className="auth-field-error">{errors.displayName}</span>
                        )}
                    </div>
                </div>

                <div className="auth-row">
                    <div className={`auth-field ${touched.locationX && errors.locationX ? 'auth-field--error' : ''}`}>
                        <label htmlFor="reg-locationX">Latitude</label>
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
                        <label htmlFor="reg-locationY">Longitude</label>
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
                </div>

                <div className="auth-row">
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
                            placeholder="8+ chars, letters & digits"
                        />
                        {touched.password && errors.password && (
                            <span className="auth-field-error">{errors.password}</span>
                        )}
                    </div>

                    <div className={`auth-field ${touched.confirmPassword && errors.confirmPassword ? 'auth-field--error' : ''}`}>
                        <label htmlFor="reg-confirmPassword">Confirm password</label>
                        <input
                            id="reg-confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Re-enter password"
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <span className="auth-field-error">{errors.confirmPassword}</span>
                        )}
                    </div>
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
