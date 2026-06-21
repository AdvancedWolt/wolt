import { useEffect, useMemo, useState } from 'react';

import RestaurantImageUpload from './RestaurantImageUpload.jsx';

const toDraft = (product) => ({
    name: product.name,
    description: product.description || '',
    price: String(product.price ?? 0),
    image: product.image || '',
});

const ManagedProduct = ({ product, busy, onSave, onDelete }) => {
    const [draft, setDraft] = useState(() => toDraft(product));
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setDraft(toDraft(product));
        setValidationError('');
    }, [product]);

    const changed = useMemo(() => (
        draft.name.trim() !== product.name
        || draft.description.trim() !== (product.description || '')
        || Number(draft.price) !== Number(product.price ?? 0)
        || draft.image !== (product.image || '')
    ), [draft, product]);

    const updateDraft = (field, value) => {
        setDraft((current) => ({ ...current, [field]: value }));
        setValidationError('');
    };

    const handleSave = () => {
        if (!draft.name.trim()) return setValidationError('Dish name is required');
        if (!draft.description.trim()) return setValidationError('Description is required');
        if (draft.price === '' || !Number.isFinite(Number(draft.price)) || Number(draft.price) < 0) {
            return setValidationError('Price must be a non-negative number');
        }

        setValidationError('');
        onSave(product.id, {
            name: draft.name.trim(),
            description: draft.description.trim(),
            price: Number(draft.price),
            image: draft.image || null,
        });
    };

    return (
        <li className="managed-product managed-product-expanded">
            <div className="managed-product-fields">
                <label>
                    Name
                    <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} disabled={busy} required />
                </label>
                <label>
                    Price (₪)
                    <input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => updateDraft('price', event.target.value)} disabled={busy} required />
                </label>
                <label className="managed-product-description">
                    Description
                    <textarea value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} disabled={busy} required />
                </label>
                <div className="managed-product-description">
                    <RestaurantImageUpload label="Dish image" value={draft.image} onChange={(image) => updateDraft('image', image)} disabled={busy} />
                </div>
            </div>
            {validationError && <span className="managed-product-error" role="alert">{validationError}</span>}
            <div className="managed-product-buttons">
                <button className="manage-action" type="button" disabled={busy || !changed} onClick={handleSave}>Save changes</button>
                <button className="manage-action manage-action-danger" type="button" disabled={busy} onClick={() => onDelete(product)}>Delete dish</button>
            </div>
        </li>
    );
};

export default ManagedProduct;
