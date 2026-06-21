import { useId, useState } from 'react';

import { readImageFile } from '../utils/image.js';

const RestaurantImageUpload = ({ value, onChange, disabled = false, label = 'Restaurant image' }) => {
    const inputId = useId();
    const [error, setError] = useState('');

    const handleFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const dataUrl = await readImageFile(file);
            setError('');
            onChange(dataUrl);
        } catch (err) {
            setError(err.message);
            event.target.value = '';
        }
    };

    return (
        <div className="restaurant-image-upload">
            <span className="restaurant-image-label">{label}</span>
            <div className="restaurant-image-control">
                <div className="restaurant-image-preview">
                    {value ? (
                        <img src={value} alt="Restaurant preview" />
                    ) : (
                        <span aria-hidden="true">📷</span>
                    )}
                </div>
                <div className="restaurant-image-actions">
                    <label className="manage-action restaurant-image-button" htmlFor={inputId}>
                        {value ? 'Change image' : 'Upload image'}
                    </label>
                    {value && (
                        <button
                            className="manage-delete-link"
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange('')}
                        >
                            Remove
                        </button>
                    )}
                    <small>JPG, PNG or WebP · max 5MB</small>
                </div>
                <input
                    id={inputId}
                    className="restaurant-image-input"
                    type="file"
                    accept="image/*"
                    disabled={disabled}
                    onChange={handleFile}
                />
            </div>
            {error && <span className="restaurant-image-error" role="alert">{error}</span>}
        </div>
    );
};

export default RestaurantImageUpload;
