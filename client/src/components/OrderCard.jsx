// Orders are placed and listed straight away; the only other state is a
// cancellation (by the customer, or when a restaurant is removed).
const STATUS_LABELS = {
    pending: 'Placed',
    cancelled: 'Cancelled',
};

const OrderCard = ({ order, restaurant, onCancel }) => {
    const itemCount = order.items?.length || 0;

    return (
        <li className="order-card">
            <div className="order-card-main">
                <h3>{restaurant?.name || 'Restaurant'}</h3>
                <span className="order-card-items">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            </div>

            <span className={`order-status order-status-${order.status}`}>
                {STATUS_LABELS[order.status] || order.status}
            </span>

            {order.status === 'pending' && (
                <button className="btn btn-secondary order-cancel" type="button" onClick={() => onCancel(order.id)}>
                    Cancel order
                </button>
            )}
        </li>
    );
};

export default OrderCard;
