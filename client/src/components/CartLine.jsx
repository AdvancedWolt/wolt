const CartLine = ({ line, onIncrement, onDecrement, onRemove }) => {
    const { product, quantity } = line;
    const price = Number(product.price ?? 0);

    return (
        <li className="cart-line">
            <div className="cart-line-media" aria-hidden="true">
                {product.image
                    ? <img src={product.image} alt="" />
                    : <span>{product.name.slice(0, 1).toUpperCase()}</span>}
            </div>

            <div className="cart-line-info">
                <h3>{product.name}</h3>
                <span className="cart-line-price">₪{price.toFixed(2)}</span>
            </div>

            <div className="cart-line-stepper">
                <button type="button" onClick={() => onDecrement(product.id)} aria-label={`Remove one ${product.name}`}>−</button>
                <span aria-label={`${quantity} in cart`}>{quantity}</span>
                <button type="button" onClick={() => onIncrement(product)} aria-label={`Add one ${product.name}`}>+</button>
            </div>

            <strong className="cart-line-subtotal">₪{(price * quantity).toFixed(2)}</strong>

            <button className="cart-line-remove" type="button" onClick={() => onRemove(product.id)} aria-label={`Remove ${product.name}`}>
                ✕
            </button>
        </li>
    );
};

export default CartLine;
