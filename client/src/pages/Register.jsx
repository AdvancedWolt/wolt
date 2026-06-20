import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import '../styles/auth.css';

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
    });
    const [imageData, setImageData] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);
    const imagePreviewRef = useRef(null);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, image: 'Image size must be less than 2MB' }));
            setTouched((prev) => ({ ...prev, displayName: true }));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            setImageData(base64);
            if (imagePreviewRef.current) {
                imagePreviewRef.current.src = base64;
            }
        };
        reader.readAsDataURL(file);
    };

    const allFieldsValid = () => {
        const fieldErrors = {};
        for (const key of Object.keys(validators)) {
            fieldErrors[key] = validators[key](form[key], form);
        }
        if (!imageData) fieldErrors.image = 'Profile picture is required';
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
        form.username === '' || form.password === '' || form.confirmPassword === '' || form.displayName === '' || form.locationX === '' || form.locationY === '' || !imageData;
    const submitDisabled = submitting || hasErrors || missingRequired;

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Join AdvancedWolt today</p>

                {serverError && <div className="auth-server-error">{serverError}</div>}

                {/* --- Image picker --- */}
                <div className="auth-image-picker" onClick={handleImageClick}>
                    {imageData ? (
                        <img
                            ref={imagePreviewRef}
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
                {errors.image && touched.displayName && (
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
