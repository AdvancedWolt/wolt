import { useState } from 'react';

const MenuItem = ({ product, quantity, onAdd }) => {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <article className="menu-item">
            <div className="menu-item-icon" aria-hidden="true">
                {product.image && !imageFailed ? (
                    <img src={product.image} alt="" onError={() => setImageFailed(true)} />
                ) : product.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="menu-item-copy">
                <h3>{product.name}</h3>
                <p>{product.description || 'No description provided'}</p>
                <strong className="menu-item-price">₪{Number(product.price ?? 0).toFixed(2)}</strong>
            </div>
            <div className="menu-item-action">
                {quantity > 0 && <span className="menu-item-quantity" aria-label={`${quantity} selected`}>{quantity}</span>}
                <button className="menu-add" type="button" onClick={() => onAdd(product)}><span aria-hidden="true">+</span> Add</button>
            </div>
        </article>
    );
};

export default MenuItem;
