import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

// An order belongs to a single restaurant, so the cart tracks one restaurant at
// a time; adding a dish from a different restaurant starts a fresh cart.
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ restaurant: null, lines: {} });

    const addItem = (product, restaurant) => {
        setCart((current) => {
            const sameRestaurant = current.restaurant?.id === restaurant.id;
            const lines = sameRestaurant ? { ...current.lines } : {};
            const existing = lines[product.id];
            lines[product.id] = { product, quantity: (existing?.quantity || 0) + 1 };
            return { restaurant, lines };
        });
    };

    const decrementItem = (productId) => {
        setCart((current) => {
            const existing = current.lines[productId];
            if (!existing) return current;
            const lines = { ...current.lines };
            if (existing.quantity <= 1) delete lines[productId];
            else lines[productId] = { ...existing, quantity: existing.quantity - 1 };
            return { restaurant: Object.keys(lines).length ? current.restaurant : null, lines };
        });
    };

    const removeItem = (productId) => {
        setCart((current) => {
            const lines = { ...current.lines };
            delete lines[productId];
            return { restaurant: Object.keys(lines).length ? current.restaurant : null, lines };
        });
    };

    const clearCart = () => setCart({ restaurant: null, lines: {} });

    const items = useMemo(() => Object.values(cart.lines), [cart.lines]);
    const count = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);
    const total = useMemo(
        () => items.reduce((sum, line) => sum + Number(line.product.price || 0) * line.quantity, 0),
        [items]
    );

    const quantityFor = (restaurantId, productId) => (
        cart.restaurant?.id === restaurantId ? cart.lines[productId]?.quantity || 0 : 0
    );

    const value = {
        restaurant: cart.restaurant,
        items,
        count,
        total,
        addItem,
        decrementItem,
        removeItem,
        clearCart,
        quantityFor,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
    return ctx;
};
