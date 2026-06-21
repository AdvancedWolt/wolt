import Thumbnail from './Thumbnail.jsx';
import { formatPrice } from '../utils/format.js';

const CartLine = ({ line, onIncrement, onDecrement, onRemove }) => {
    const { product, quantity } = line;
    const price = Number(product.price ?? 0);

    return (
        <li className="cart-line">
            <div className="cart-line-media" aria-hidden="true">
                <Thumbnail src={product.image} name={product.name} />
            </div>

            <div className="cart-line-info">
                <h3>{product.name}</h3>
                <span className="cart-line-price">{formatPrice(price)}</span>
            </div>

            <div className="cart-line-stepper">
                <button type="button" onClick={() => onDecrement(product.id)} aria-label={`Remove one ${product.name}`}>−</button>
                <span aria-label={`${quantity} in cart`}>{quantity}</span>
                <button type="button" onClick={() => onIncrement(product)} aria-label={`Add one ${product.name}`}>+</button>
            </div>

            <strong className="cart-line-subtotal">{formatPrice(price * quantity)}</strong>

            <button className="cart-line-remove" type="button" onClick={() => onRemove(product.id)} aria-label={`Remove ${product.name}`}>
                ✕
            </button>
        </li>
    );
};

export default CartLine;
