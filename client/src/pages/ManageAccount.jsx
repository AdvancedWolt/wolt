import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { updateUser } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/manage-account.css';

const ManageAccount = () => {
    const { user, updateAuthUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        displayName: user?.displayName || '',
        locationX: user?.location?.x !== undefined ? String(user.location.x) : '',
        locationY: user?.location?.y !== undefined ? String(user.location.y) : '',
    });
    const [imageData, setImageData] = useState(user?.image || null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    // Sync form with user state when it changes
    useEffect(() => {
        if (user) {
            setForm({
                displayName: user.displayName || '',
                locationX: user.location?.x !== undefined ? String(user.location.x) : '',
                locationY: user.location?.y !== undefined ? String(user.location.y) : '',
            });
            setImageData(user.image || null);
        }
    }, [user]);

    const validators = {
        displayName: (val) => (!val || !val.trim() ? 'Display name is required' : ''),
        locationX: (val) => {
            const num = Number(val);
            if (!val || val.trim() === '') return 'Latitude is required';
            if (Number.isNaN(num)) return 'Coordinate must be a number';
            return '';
        },
        locationY: (val) => {
            const num = Number(val);
            if (!val || val.trim() === '') return 'Longitude is required';
            if (Number.isNaN(num)) return 'Coordinate must be a number';
            return '';
        },
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next = { ...form, [name]: value };
        setForm(next);

        if (touched[name]) {
            const validator = validators[name];
            setErrors((prev) => ({
                ...prev,
                [name]: validator ? validator(value) : '',
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const validator = validators[name];
        if (validator) {
            setErrors((prev) => ({ ...prev, [name]: validator(value) }));
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImageData(null);
        fileInputRef.current.value = '';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
            return;
        }

        setErrors((prev) => ({ ...prev, image: '' }));

        const reader = new FileReader();
        reader.onload = () => {
            setImageData(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const fieldErrors = {};
        let isValid = true;
        Object.keys(validators).forEach((key) => {
            const err = validators[key](form[key]);
            fieldErrors[key] = err;
            if (err) isValid = false;
        });
        setErrors(fieldErrors);
        setTouched({ displayName: true, locationX: true, locationY: true });
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccessMessage('');

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const updates = {
                displayName: form.displayName.trim(),
                location: {
                    x: Number(form.locationX),
                    y: Number(form.locationY),
                },
                image: imageData,
            };

            await updateUser(user.id, updates);
            updateAuthUser(updates);

            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setServerError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const roleName = user?.role === 'restaurant_owner' ? 'Restaurant Owner' : 'Customer';
    const roleClass = user?.role === 'restaurant_owner' ? 'owner' : 'customer';

    return (
        <div className="manage-account-container">
            <header className="account-header">
                <p className="search-subtitle">Account Management</p>
                <h1>Profile Settings</h1>
                <p>Manage your account settings, display preferences, and coordinates.</p>
            </header>

            {serverError && (
                <div className="account-alert account-alert-error" role="alert">
                    {serverError}
                </div>
            )}
            {successMessage && (
                <div className="account-alert account-alert-success" role="alert">
                    {successMessage}
                </div>
            )}

            <div className="account-layout">
                {/* Profile Card Sidebar */}
                <aside className="profile-summary-card">
                    <div className="avatar-upload-section">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <div
                            className="avatar-container"
                            onClick={handleImageClick}
                            role="button"
                            tabIndex={0}
                            title="Click to upload profile picture"
                        >
                            {imageData ? (
                                <img src={imageData} alt="Profile" className="avatar-image" />
                            ) : (
                                <span className="avatar-fallback" aria-hidden="true">
                                    {user?.username?.slice(0, 1).toUpperCase()}
                                </span>
                            )}
                            <div className="avatar-overlay">
                                <span className="avatar-overlay-icon" aria-hidden="true">📸</span>
                                <span>Change Photo</span>
                            </div>
                        </div>
                        {imageData && (
                            <button
                                type="button"
                                className="remove-avatar-btn"
                                onClick={handleRemoveImage}
                                title="Remove photo"
                                aria-label="Remove profile photo"
                            >
                                &times;
                            </button>
                        )}
                    </div>

                    <div className="profile-names">
                        <h2>{user?.displayName || user?.username}</h2>
                        <p>@{user?.username}</p>
                    </div>

                    <span className={`role-badge ${roleClass}`}>{roleName}</span>
                </aside>

                {/* Form Fields Main Body */}
                <main className="settings-form-card">
                    <h2 className="settings-section-title">Personal Details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="settings-form-group">
                            <label htmlFor="username">Username (Locked)</label>
                            <div className="settings-input-wrapper">
                                <span className="settings-input-icon" aria-hidden="true">🔒</span>
                                <input
                                    type="text"
                                    id="username"
                                    value={user?.username || ''}
                                    disabled
                                    className="settings-input"
                                />
                            </div>
                        </div>

                        <div className="settings-form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <div className="settings-input-wrapper">
                                <span className="settings-input-icon" aria-hidden="true">👤</span>
                                <input
                                    type="text"
                                    id="displayName"
                                    name="displayName"
                                    value={form.displayName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`settings-input ${
                                        errors.displayName && touched.displayName ? 'input-error' : ''
                                    }`}
                                    placeholder="Enter your display name"
                                    required
                                />
                            </div>
                            {errors.displayName && touched.displayName && (
                                <span className="settings-error-message">{errors.displayName}</span>
                            )}
                        </div>

                        <h2 className="settings-section-title" style={{ marginTop: '36px' }}>
                            Delivery Address Location
                        </h2>

                        <div className="coordinates-row">
                            <div className="settings-form-group">
                                <label htmlFor="locationX">Latitude (X Coordinate)</label>
                                <div className="settings-input-wrapper">
                                    <span className="settings-input-icon" aria-hidden="true">📍</span>
                                    <input
                                        type="text"
                                        id="locationX"
                                        name="locationX"
                                        value={form.locationX}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`settings-input ${
                                            errors.locationX && touched.locationX ? 'input-error' : ''
                                        }`}
                                        placeholder="e.g. 32.085"
                                        required
                                    />
                                </div>
                                {errors.locationX && touched.locationX && (
                                    <span className="settings-error-message">{errors.locationX}</span>
                                )}
                            </div>

                            <div className="settings-form-group">
                                <label htmlFor="locationY">Longitude (Y Coordinate)</label>
                                <div className="settings-input-wrapper">
                                    <span className="settings-input-icon" aria-hidden="true">📍</span>
                                    <input
                                        type="text"
                                        id="locationY"
                                        name="locationY"
                                        value={form.locationY}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`settings-input ${
                                            errors.locationY && touched.locationY ? 'input-error' : ''
                                        }`}
                                        placeholder="e.g. 34.781"
                                        required
                                    />
                                </div>
                                {errors.locationY && touched.locationY && (
                                    <span className="settings-error-message">{errors.locationY}</span>
                                )}
                            </div>
                        </div>

                        <div className="settings-actions">
                            <button
                                type="submit"
                                className="btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving changes...' : 'Save Profile'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default ManageAccount;
