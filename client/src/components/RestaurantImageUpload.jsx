import { useId, useState } from 'react';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const RestaurantImageUpload = ({ value, onChange, disabled = false, label = 'Restaurant image' }) => {
    const inputId = useId();
    const [error, setError] = useState('');

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file');
            event.target.value = '';
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setError('Image must be smaller than 5MB');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setError('');
            onChange(reader.result);
        };
        reader.onerror = () => setError('Could not read this image');
        reader.readAsDataURL(file);
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
