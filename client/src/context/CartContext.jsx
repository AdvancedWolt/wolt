import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'aw_cart';
const EMPTY_CART = { restaurant: null, lines: {} };

const loadCart = () => {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return EMPTY_CART;
    try {
        const parsed = JSON.parse(raw);
        return parsed?.lines ? parsed : EMPTY_CART;
    } catch {
        localStorage.removeItem(CART_KEY);
        return EMPTY_CART;
    }
};

// An order belongs to a single restaurant, so the cart tracks one restaurant at
// a time; adding a dish from a different restaurant starts a fresh cart. The cart
// is mirrored to localStorage so it survives a page refresh.
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(loadCart);

    useEffect(() => {
        if (Object.keys(cart.lines).length) localStorage.setItem(CART_KEY, JSON.stringify(cart));
        else localStorage.removeItem(CART_KEY);
    }, [cart]);

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

    const clearCart = () => setCart(EMPTY_CART);

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
