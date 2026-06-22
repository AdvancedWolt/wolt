import Thumbnail from './Thumbnail.jsx';
import { formatPrice } from '../utils/format.js';

const MenuItem = ({ product, quantity, onAdd }) => (
    <article className="menu-item">
        <div className="menu-item-icon" aria-hidden="true">
            <Thumbnail src={product.image} name={product.name} />
        </div>
        <div className="menu-item-copy">
            <h3>{product.name}</h3>
            <p>{product.description || 'No description provided'}</p>
            <strong className="menu-item-price">{formatPrice(product.price)}</strong>
        </div>
        <div className="menu-item-action">
            {quantity > 0 && <span className="menu-item-quantity" aria-label={`${quantity} selected`}>{quantity}</span>}
            <button className="menu-add" type="button" onClick={() => onAdd(product)}><span aria-hidden="true">+</span> Add</button>
        </div>
    </article>
);

export default MenuItem;
