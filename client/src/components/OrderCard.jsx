import { Link } from 'react-router-dom';

// Orders only ever reach 'pending' (Placed) or 'cancelled' in this app.
const STATUS_LABELS = {
    pending: 'Placed',
    cancelled: 'Cancelled',
};

const OrderCard = ({ order, restaurant }) => {
    const itemCount = order.items?.length || 0;

    return (
        <li>
            <Link className="order-card" to={`/orders/${order.id}`}>
                <div className="order-card-main">
                    <h3>{restaurant?.name || 'Restaurant'}</h3>
                    <span className="order-card-items">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                </div>

                <span className={`order-status order-status-${order.status}`}>
                    {STATUS_LABELS[order.status] || order.status}
                </span>

                <span className="order-card-arrow" aria-hidden="true">›</span>
            </Link>
        </li>
    );
};

export default OrderCard;
