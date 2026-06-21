import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    createProduct,
    createRestaurant,
    deleteProduct,
    deleteRestaurant,
    getProducts,
    getRestaurants,
    updateProduct,
    updateRestaurant,
} from '../api/endpoints.js';
import ManagedProduct from '../components/ManagedProduct.jsx';
import RestaurantImageUpload from '../components/RestaurantImageUpload.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/manage.css';

const emptyRestaurant = {
    name: '',
    category: '',
    image: '',
    promoted: false,
    locationX: '',
    locationY: '',
};

const emptyProduct = {
    name: '',
    description: '',
    price: '',
    image: '',
};

const Manage = () => {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
    const [newRestaurant, setNewRestaurant] = useState(emptyRestaurant);
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState(emptyProduct);
    const [status, setStatus] = useState('loading');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const selectedRestaurant = useMemo(
        () => restaurants.find((restaurant) => restaurant.id === selectedId) || null,
        [restaurants, selectedId]
    );

    const loadRestaurants = useCallback(async (preferredId) => {
        setError('');
        try {
            const allRestaurants = await getRestaurants();
            const ownedRestaurants = allRestaurants.filter(
                (restaurant) => restaurant.ownerId === user.id
            );
            setRestaurants(ownedRestaurants);
            setSelectedId((current) => {
                const candidate = preferredId || current;
                return ownedRestaurants.some((restaurant) => restaurant.id === candidate)
                    ? candidate
                    : ownedRestaurants[0]?.id || null;
            });
            setStatus('ready');
        } catch (err) {
            setError(err.message || 'Could not load your restaurants');
            setStatus('error');
        }
    }, [user?.id]);

    const loadProducts = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            setProducts([]);
            return;
        }
        try {
            setProducts(await getProducts(restaurantId));
        } catch (err) {
            setError(err.message || 'Could not load the menu');
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'restaurant_owner') loadRestaurants();
    }, [loadRestaurants, user?.role]);

    useEffect(() => {
        if (!selectedRestaurant) {
            setRestaurantForm(emptyRestaurant);
            setProducts([]);
            return;
        }

        setRestaurantForm({
            name: selectedRestaurant.name,
            category: selectedRestaurant.category || '',
            image: selectedRestaurant.image || '',
            promoted: Boolean(selectedRestaurant.promoted),
            locationX: selectedRestaurant.location?.x ?? '',
            locationY: selectedRestaurant.location?.y ?? '',
        });
        loadProducts(selectedRestaurant.id);
    }, [loadProducts, selectedRestaurant]);

    const clearMessages = () => {
        setError('');
        setNotice('');
    };

    const handleCreateRestaurant = async (event) => {
        event.preventDefault();
        clearMessages();
        if (!newRestaurant.name.trim()) return setError('Restaurant name is required');
        if (newRestaurant.locationX === '' || newRestaurant.locationY === '') {
            return setError('Restaurant location coordinates are required');
        }

        setBusy(true);
        try {
            await createRestaurant({
                ...newRestaurant,
                name: newRestaurant.name.trim(),
                category: newRestaurant.category.trim() || 'Other',
                image: newRestaurant.image.trim() || null,
                location: {
                    x: Number(newRestaurant.locationX),
                    y: Number(newRestaurant.locationY),
                },
            });
            setNewRestaurant(emptyRestaurant);
            setNotice('Restaurant created');
            await loadRestaurants();
        } catch (err) {
            setError(err.message || 'Could not create restaurant');
        } finally {
            setBusy(false);
        }
    };

    const handleSaveRestaurant = async (event) => {
        event.preventDefault();
        clearMessages();
        if (!restaurantForm.name.trim()) return setError('Restaurant name is required');
        if (restaurantForm.locationX === '' || restaurantForm.locationY === '') {
            return setError('Restaurant location coordinates are required');
        }

        setBusy(true);
        try {
            await updateRestaurant(selectedId, {
                ...restaurantForm,
                name: restaurantForm.name.trim(),
                category: restaurantForm.category.trim() || 'Other',
                image: restaurantForm.image.trim() || null,
                location: {
                    x: Number(restaurantForm.locationX),
                    y: Number(restaurantForm.locationY),
                },
            });
            setNotice('Restaurant details saved');
            await loadRestaurants(selectedId);
        } catch (err) {
            setError(err.message || 'Could not update restaurant');
        } finally {
            setBusy(false);
        }
    };

    const handleDeleteRestaurant = async () => {
        if (!window.confirm(`Delete ${selectedRestaurant.name} and its entire menu?`)) return;
        clearMessages();
        setBusy(true);
        try {
            await deleteRestaurant(selectedId);
            setNotice('Restaurant deleted');
            await loadRestaurants();
        } catch (err) {
            setError(err.message || 'Could not delete restaurant');
        } finally {
            setBusy(false);
        }
    };

    const handleCreateProduct = async (event) => {
        event.preventDefault();
        clearMessages();
        if (!newProduct.name.trim()) return setError('Dish name is required');
        if (!newProduct.description.trim()) return setError('Dish description is required');
        if (newProduct.price === '' || !Number.isFinite(Number(newProduct.price)) || Number(newProduct.price) < 0) {
            return setError('Dish price must be a non-negative number');
        }

        setBusy(true);
        try {
            await createProduct(selectedId, {
                name: newProduct.name.trim(),
                description: newProduct.description.trim(),
                price: Number(newProduct.price),
                image: newProduct.image || null,
            });
            setNewProduct(emptyProduct);
            setNotice('Dish added to the menu');
            await loadProducts(selectedId);
        } catch (err) {
            setError(err.message || 'Could not add dish');
        } finally {
            setBusy(false);
        }
    };

    const handleUpdateProduct = async (productId, updates) => {
        clearMessages();
        setBusy(true);
        try {
            await updateProduct(selectedId, productId, updates);
            setNotice('Dish updated');
            await loadProducts(selectedId);
        } catch (err) {
            setError(err.message || 'Could not update dish');
        } finally {
            setBusy(false);
        }
    };

    const handleDeleteProduct = async (product) => {
        if (!window.confirm(`Remove ${product.name} from the menu?`)) return;
        clearMessages();
        setBusy(true);
        try {
            await deleteProduct(selectedId, product.id);
            setNotice('Dish removed');
            await loadProducts(selectedId);
        } catch (err) {
            setError(err.message || 'Could not delete dish');
        } finally {
            setBusy(false);
        }
    };

    const updateField = (setter) => (event) => {
        const { name, type, checked, value } = event.target;
        setter((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    if (user?.role !== 'restaurant_owner') {
        return (
            <section className="manage-gate">
                <span aria-hidden="true">🔒</span>
                <h1>Restaurant owners only</h1>
                <p>Create a restaurant-owner account to manage restaurants and menus.</p>
                <Link className="btn" to="/register">Create owner account</Link>
            </section>
        );
    }

    if (status === 'loading') {
        return <section className="manage-gate" role="status"><div className="feed-spinner" /><h1>Loading your restaurants</h1></section>;
    }

    return (
        <div className="manage-page">
            <header className="manage-header">
                <div>
                    <p>Owner workspace</p>
                    <h1>Manage restaurants</h1>
                    <span>Create your storefronts and keep every menu up to date.</span>
                </div>
            </header>

            {error && <div className="manage-message manage-message-error" role="alert">{error}</div>}
            {notice && <div className="manage-message manage-message-success" role="status">{notice}</div>}

            <section className="manage-panel">
                <div className="manage-panel-title">
                    <div><p>New storefront</p><h2>Create a restaurant</h2></div>
                </div>
                <form className="manage-form" onSubmit={handleCreateRestaurant}>
                    <label>Name<input name="name" value={newRestaurant.name} onChange={updateField(setNewRestaurant)} placeholder="Restaurant name" required /></label>
                    <label>Category<input name="category" value={newRestaurant.category} onChange={updateField(setNewRestaurant)} placeholder="Italian, Burgers…" /></label>
                    <label>Location X<input name="locationX" type="number" step="any" value={newRestaurant.locationX} onChange={updateField(setNewRestaurant)} placeholder="32.0853" required /></label>
                    <label>Location Y<input name="locationY" type="number" step="any" value={newRestaurant.locationY} onChange={updateField(setNewRestaurant)} placeholder="34.7818" required /></label>
                    <div className="manage-wide">
                        <RestaurantImageUpload
                            value={newRestaurant.image}
                            disabled={busy}
                            onChange={(image) => setNewRestaurant((current) => ({ ...current, image }))}
                        />
                    </div>
                    <label className="manage-check"><input name="promoted" type="checkbox" checked={newRestaurant.promoted} onChange={updateField(setNewRestaurant)} />Promoted</label>
                    <button className="btn" type="submit" disabled={busy}>Create restaurant</button>
                </form>
            </section>

            <div className="manage-workspace">
                <aside className="manage-sidebar">
                    <div className="manage-panel-title"><div><p>Your portfolio</p><h2>My restaurants</h2></div><span>{restaurants.length}</span></div>
                    {restaurants.length ? restaurants.map((restaurant) => (
                        <button
                            key={restaurant.id}
                            className={restaurant.id === selectedId ? 'manage-restaurant active' : 'manage-restaurant'}
                            type="button"
                            onClick={() => setSelectedId(restaurant.id)}
                        >
                            <strong>{restaurant.name}</strong><span>{restaurant.category}</span>
                        </button>
                    )) : <p className="manage-empty-copy">You haven&apos;t created a restaurant yet.</p>}
                </aside>

                <main className="manage-editor">
                    {selectedRestaurant ? (
                        <>
                            <section className="manage-panel">
                                <div className="manage-panel-title"><div><p>Storefront</p><h2>Edit restaurant</h2></div><button className="manage-delete-link" type="button" disabled={busy} onClick={handleDeleteRestaurant}>Delete restaurant</button></div>
                                <form className="manage-form" onSubmit={handleSaveRestaurant}>
                                    <label>Name<input name="name" value={restaurantForm.name} onChange={updateField(setRestaurantForm)} required /></label>
                                    <label>Category<input name="category" value={restaurantForm.category} onChange={updateField(setRestaurantForm)} /></label>
                                    <label>Location X<input name="locationX" type="number" step="any" value={restaurantForm.locationX} onChange={updateField(setRestaurantForm)} required /></label>
                                    <label>Location Y<input name="locationY" type="number" step="any" value={restaurantForm.locationY} onChange={updateField(setRestaurantForm)} required /></label>
                                    <div className="manage-wide">
                                        <RestaurantImageUpload
                                            value={restaurantForm.image}
                                            disabled={busy}
                                            onChange={(image) => setRestaurantForm((current) => ({ ...current, image }))}
                                        />
                                    </div>
                                    <label className="manage-check"><input name="promoted" type="checkbox" checked={restaurantForm.promoted} onChange={updateField(setRestaurantForm)} />Promoted</label>
                                    <button className="btn" type="submit" disabled={busy}>Save details</button>
                                </form>
                            </section>

                            <section className="manage-panel">
                                <div className="manage-panel-title"><div><p>Menu</p><h2>Dishes</h2></div><span>{products.length}</span></div>
                                <form className="manage-product-create" onSubmit={handleCreateProduct}>
                                    <label>Name<input value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} placeholder="Dish name" required /></label>
                                    <label>Price (₪)<input type="number" min="0" step="0.01" value={newProduct.price} onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))} placeholder="0.00" required /></label>
                                    <label className="manage-wide">Description<textarea value={newProduct.description} onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the dish" required /></label>
                                    <div className="manage-wide"><RestaurantImageUpload label="Dish image" value={newProduct.image} onChange={(image) => setNewProduct((current) => ({ ...current, image }))} disabled={busy} /></div>
                                    <button className="btn" type="submit" disabled={busy}>Add dish</button>
                                </form>
                                {products.length ? (
                                    <ul className="managed-products">
                                        {products.map((product) => <ManagedProduct key={product.id} product={product} busy={busy} onSave={handleUpdateProduct} onDelete={handleDeleteProduct} />)}
                                    </ul>
                                ) : <p className="manage-empty-copy">This menu is empty. Add the first dish above.</p>}
                            </section>
                        </>
                    ) : (
                        <section className="manage-panel manage-editor-empty"><span aria-hidden="true">🍽️</span><h2>Create your first restaurant</h2><p>Use the form above to get started.</p></section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Manage;
