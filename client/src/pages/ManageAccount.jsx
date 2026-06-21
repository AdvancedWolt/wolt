import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { updateUser } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useImagePicker } from '../hooks/useImagePicker.js';
import { validateUsername, validateDisplayName, validateCoordinate } from '../utils/validators.js';
import '../styles/manage-account.css';

const validators = {
    username: validateUsername,
    displayName: validateDisplayName,
    locationX: (value) => validateCoordinate(value, 'Latitude'),
    locationY: (value) => validateCoordinate(value, 'Longitude'),
};

const ManageAccount = () => {
    const { user, updateAuthUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: user?.username || '',
        displayName: user?.displayName || '',
        locationX: user?.location?.x !== undefined ? String(user.location.x) : '',
        locationY: user?.location?.y !== undefined ? String(user.location.y) : '',
    });
    const image = useImagePicker(user?.image || null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Keep the form in step with the signed-in user.
    useEffect(() => {
        if (user) {
            setForm({
                username: user.username || '',
                displayName: user.displayName || '',
                locationX: user.location?.x !== undefined ? String(user.location.x) : '',
                locationY: user.location?.y !== undefined ? String(user.location.y) : '',
            });
            image.setImageData(user.image || null);
        }
    }, [user]);

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

    const validateForm = () => {
        const fieldErrors = {};
        let isValid = true;
        Object.keys(validators).forEach((key) => {
            const err = validators[key](form[key]);
            fieldErrors[key] = err;
            if (err) isValid = false;
        });
        setErrors(fieldErrors);
        setTouched({ username: true, displayName: true, locationX: true, locationY: true });
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
                username: form.username.trim(),
                displayName: form.displayName.trim(),
                location: {
                    x: Number(form.locationX),
                    y: Number(form.locationY),
                },
                image: image.imageData,
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
                <p className="search-subtitle">Account</p>
                <h1>Profile settings</h1>
                <p>Update your display name, photo and delivery location.</p>
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
                            ref={image.inputRef}
                            onChange={image.onChange}
                            style={{ display: 'none' }}
                        />
                        <div
                            className="avatar-container"
                            onClick={image.open}
                            role="button"
                            tabIndex={0}
                            title="Click to upload profile picture"
                        >
                            {image.imageData ? (
                                <img src={image.imageData} alt="Profile" className="avatar-image" />
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
                        {image.imageData && (
                            <button
                                type="button"
                                className="remove-avatar-btn"
                                onClick={image.remove}
                                title="Remove photo"
                                aria-label="Remove profile photo"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    {image.error && (
                        <span className="settings-error-message" role="alert">{image.error}</span>
                    )}

                    <div className="profile-names">
                        <h2>{user?.displayName || user?.username}</h2>
                        <p>@{user?.username}</p>
                    </div>

                    <span className={`role-badge ${roleClass}`}>{roleName}</span>
                </aside>

                {/* Form Fields Main Body */}
                <main className="settings-form-card">
                    <h2 className="settings-section-title">Personal details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="settings-form-group">
                            <label htmlFor="username">Username</label>
                            <div className="settings-input-wrapper">
                                <span className="settings-input-icon" aria-hidden="true">@</span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`settings-input ${
                                        errors.username && touched.username ? 'input-error' : ''
                                    }`}
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                            {errors.username && touched.username && (
                                <span className="settings-error-message">{errors.username}</span>
                            )}
                        </div>

                        <div className="settings-form-group">
                            <label htmlFor="displayName">Display name</label>
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

                        <h2 className="settings-section-title settings-section-title-spaced">
                            Delivery location
                        </h2>

                        <div className="coordinates-row">
                            <div className="settings-form-group">
                                <label htmlFor="locationX">Latitude (X)</label>
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
                                <label htmlFor="locationY">Longitude (Y)</label>
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
                                {submitting ? 'Saving changes…' : 'Save changes'}
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
