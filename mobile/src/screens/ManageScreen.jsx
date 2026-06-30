import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Field from '../components/Field';
import Loading from '../components/Loading';
import {
  createProduct,
  createRestaurant,
  deleteProduct,
  deleteRestaurant,
  getProducts,
  getRestaurants,
  updateProduct,
  updateRestaurant,
} from '../api/endpoints';
import { CATEGORIES, ROLES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useImagePicker } from '../hooks/useImagePicker';
import { formatPrice } from '../utils/format';

const emptyRestaurant = {
  name: '',
  category: '',
  promoted: false,
  locationX: '',
  locationY: '',
};

const emptyProduct = {
  name: '',
  description: '',
  price: '',
};

const toRestaurantForm = (restaurant) => ({
  name: restaurant?.name || '',
  category: restaurant?.category || '',
  promoted: Boolean(restaurant?.promoted),
  locationX: restaurant?.location?.x === undefined ? '' : String(restaurant.location.x),
  locationY: restaurant?.location?.y === undefined ? '' : String(restaurant.location.y),
});

const isNumberText = (value) => value !== '' && Number.isFinite(Number(value));

const getRestaurantError = (form) => {
  if (!form.name.trim()) return 'Restaurant name is required';
  if (!isNumberText(form.locationX) || !isNumberText(form.locationY)) {
    return 'Restaurant location coordinates are required';
  }
  return '';
};

const getProductError = (form) => {
  if (!form.name.trim()) return 'Dish name is required';
  if (!form.description.trim()) return 'Dish description is required';
  if (!isNumberText(form.price) || Number(form.price) < 0) {
    return 'Dish price must be a non-negative number';
  }
  return '';
};

const buildRestaurantPayload = (form, image) => ({
  name: form.name.trim(),
  category: form.category.trim() || 'Other',
  promoted: Boolean(form.promoted),
  image: image || null,
  location: { x: Number(form.locationX), y: Number(form.locationY) },
});

const buildProductPayload = (form, image) => ({
  name: form.name.trim(),
  description: form.description.trim(),
  price: Number(form.price),
  image: image || null,
});

const CategoryPicker = ({ value, onChange, disabled }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.categoryWrap}>
      <AppText variant="small" muted style={styles.label}>Category</AppText>
      <View style={styles.categories}>
        {CATEGORIES.map((category) => {
          const active = value === category;
          return (
            <Pressable
              key={category}
              disabled={disabled}
              onPress={() => onChange(category)}
              style={({ pressed }) => [
                styles.category,
                {
                  backgroundColor: active ? theme.brand : theme.card,
                  borderColor: active ? theme.brand : theme.border,
                  opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <AppText
                variant="small"
                weight="700"
                color={active ? theme.onBrand : theme.text}
              >
                {category}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const ImageField = ({ title, picker, disabled }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.imageBlock}>
      <AppText variant="small" muted style={styles.label}>{title}</AppText>
      <Pressable
        disabled={disabled}
        onPress={picker.pick}
        style={({ pressed }) => [
          styles.imagePicker,
          { borderColor: theme.border, backgroundColor: theme.card, opacity: disabled ? 0.55 : pressed ? 0.82 : 1 },
        ]}
      >
        {picker.imageData ? (
          <Image source={{ uri: picker.imageData }} style={styles.preview} />
        ) : (
          <View style={styles.previewEmpty}>
            <AppText muted>Add image</AppText>
          </View>
        )}
      </Pressable>
      <View style={styles.imageActions}>
        <Button title="Choose image" variant="secondary" onPress={picker.pick} disabled={disabled} style={styles.smallButton} />
        {picker.imageData ? (
          <Button title="Remove" variant="secondary" onPress={picker.remove} disabled={disabled} style={styles.smallButton} />
        ) : null}
      </View>
      {picker.error ? <AppText variant="small" color={theme.danger}>{picker.error}</AppText> : null}
    </View>
  );
};

const ManageScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const createRestaurantImage = useImagePicker();
  const editRestaurantImage = useImagePicker();
  const createProductImage = useImagePicker();
  const editProductImage = useImagePicker();

  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const [newRestaurant, setNewRestaurant] = useState(emptyRestaurant);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(emptyProduct);
  const [status, setStatus] = useState('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === selectedId) || null,
    [restaurants, selectedId]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) || null,
    [editingProductId, products]
  );

  const clearMessages = () => {
    setError('');
    setNotice('');
  };

  const loadProducts = useCallback(async (restaurantId) => {
    if (!restaurantId) {
      setProducts([]);
      return;
    }
    setProducts(await getProducts(restaurantId));
  }, []);

  const loadRestaurants = useCallback(async (preferredId) => {
    if (!user?.id) return;
    setError('');
    try {
      const allRestaurants = await getRestaurants();
      const owned = Array.isArray(allRestaurants)
        ? allRestaurants.filter((restaurant) => restaurant.ownerId === user.id)
        : [];
      setRestaurants(owned);
      setSelectedId((current) => {
        const candidate = preferredId || current;
        return owned.some((restaurant) => restaurant.id === candidate)
          ? candidate
          : owned[0]?.id || null;
      });
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load your restaurants');
      setStatus('error');
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === ROLES.OWNER) loadRestaurants();
    else setStatus('ready');
  }, [loadRestaurants, user?.role]);

  useEffect(() => {
    if (!selectedRestaurant) {
      setRestaurantForm(emptyRestaurant);
      editRestaurantImage.setImageData(null);
      setProducts([]);
      setEditingProductId(null);
      return;
    }

    setRestaurantForm(toRestaurantForm(selectedRestaurant));
    editRestaurantImage.setImageData(selectedRestaurant.image || null);
    setEditingProductId(null);
    loadProducts(selectedRestaurant.id).catch((err) => setError(err.message || 'Could not load the menu'));
  }, [selectedRestaurant?.id, loadProducts]);

  useEffect(() => {
    if (!selectedProduct) {
      setEditingProduct(emptyProduct);
      editProductImage.setImageData(null);
      return;
    }

    setEditingProduct({
      name: selectedProduct.name || '',
      description: selectedProduct.description || '',
      price: selectedProduct.price === undefined ? '' : String(selectedProduct.price),
    });
    editProductImage.setImageData(selectedProduct.image || null);
  }, [selectedProduct?.id]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadRestaurants(selectedId);
      if (selectedId) await loadProducts(selectedId);
    } finally {
      setRefreshing(false);
    }
  };

  const createRestaurantSubmit = async () => {
    clearMessages();
    const validation = getRestaurantError(newRestaurant);
    if (validation) return setError(validation);
    if (createRestaurantImage.error) return setError(createRestaurantImage.error);

    setBusy(true);
    try {
      await createRestaurant(buildRestaurantPayload(newRestaurant, createRestaurantImage.imageData));
      setNewRestaurant(emptyRestaurant);
      createRestaurantImage.remove();
      setNotice('Restaurant created');
      await loadRestaurants();
    } catch (err) {
      setError(err.message || 'Could not create restaurant');
    } finally {
      setBusy(false);
    }
  };

  const saveRestaurantSubmit = async () => {
    if (!selectedRestaurant) return;
    clearMessages();
    const validation = getRestaurantError(restaurantForm);
    if (validation) return setError(validation);
    if (editRestaurantImage.error) return setError(editRestaurantImage.error);

    setBusy(true);
    try {
      await updateRestaurant(selectedRestaurant.id, buildRestaurantPayload(restaurantForm, editRestaurantImage.imageData));
      setNotice('Restaurant details saved');
      await loadRestaurants(selectedRestaurant.id);
    } catch (err) {
      setError(err.message || 'Could not update restaurant');
    } finally {
      setBusy(false);
    }
  };

  const removeRestaurant = async () => {
    if (!selectedRestaurant) return;
    clearMessages();
    setBusy(true);
    try {
      await deleteRestaurant(selectedRestaurant.id);
      setNotice('Restaurant deleted. Its menu was cleared.');
      setProducts([]);
      setSelectedId(null);
      await loadRestaurants();
    } catch (err) {
      setError(err.message || 'Could not delete restaurant');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteRestaurant = () => {
    if (!selectedRestaurant) return;
    Alert.alert(
      'Delete restaurant?',
      `Delete ${selectedRestaurant.name} and its entire menu?`,
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: removeRestaurant },
      ]
    );
  };

  const createProductSubmit = async () => {
    if (!selectedRestaurant) return;
    clearMessages();
    const validation = getProductError(newProduct);
    if (validation) return setError(validation);
    if (createProductImage.error) return setError(createProductImage.error);

    setBusy(true);
    try {
      await createProduct(selectedRestaurant.id, buildProductPayload(newProduct, createProductImage.imageData));
      setNewProduct(emptyProduct);
      createProductImage.remove();
      setNotice('Dish added to the menu');
      await loadProducts(selectedRestaurant.id);
    } catch (err) {
      setError(err.message || 'Could not add dish');
    } finally {
      setBusy(false);
    }
  };

  const saveProductSubmit = async () => {
    if (!selectedRestaurant || !selectedProduct) return;
    clearMessages();
    const validation = getProductError(editingProduct);
    if (validation) return setError(validation);
    if (editProductImage.error) return setError(editProductImage.error);

    setBusy(true);
    try {
      await updateProduct(
        selectedRestaurant.id,
        selectedProduct.id,
        buildProductPayload(editingProduct, editProductImage.imageData)
      );
      setNotice('Dish updated');
      await loadProducts(selectedRestaurant.id);
    } catch (err) {
      setError(err.message || 'Could not update dish');
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (product) => {
    if (!selectedRestaurant) return;
    clearMessages();
    setBusy(true);
    try {
      await deleteProduct(selectedRestaurant.id, product.id);
      setNotice('Dish removed');
      if (editingProductId === product.id) setEditingProductId(null);
      await loadProducts(selectedRestaurant.id);
    } catch (err) {
      setError(err.message || 'Could not delete dish');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteProduct = (product) => {
    Alert.alert(
      'Remove dish?',
      `Remove ${product.name} from this menu?`,
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeProduct(product) },
      ]
    );
  };

  const updateNewRestaurant = (field, value) => setNewRestaurant((current) => ({ ...current, [field]: value }));
  const updateRestaurantForm = (field, value) => setRestaurantForm((current) => ({ ...current, [field]: value }));
  const updateNewProduct = (field, value) => setNewProduct((current) => ({ ...current, [field]: value }));
  const updateEditingProduct = (field, value) => setEditingProduct((current) => ({ ...current, [field]: value }));

  if (user?.role !== ROLES.OWNER) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="800">Restaurant owners only</AppText>
        <AppText muted style={styles.centerText}>Create an owner account to manage restaurants and dishes.</AppText>
      </View>
    );
  }

  if (status === 'loading') return <Loading message="Loading your restaurants" />;

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="800">We couldn't load your restaurants</AppText>
        <AppText muted style={styles.centerText}>{error}</AppText>
        <Button title="Try again" onPress={() => loadRestaurants()} style={styles.centerButton} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.fill, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.brand} />}
      >
        <View style={styles.header}>
          <AppText variant="title" weight="800">Manage restaurants</AppText>
          <AppText muted>Create storefronts and keep menus live from your phone.</AppText>
        </View>

        {error ? (
          <View style={[styles.banner, { borderColor: theme.danger, backgroundColor: theme.dangerSoft }]}>
            <AppText color={theme.danger} weight="700">{error}</AppText>
          </View>
        ) : null}
        {notice ? (
          <View style={[styles.banner, { borderColor: theme.success }]}>
            <AppText color={theme.success} weight="700">{notice}</AppText>
          </View>
        ) : null}

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <AppText variant="subtitle" weight="800">Create restaurant</AppText>
          <Field label="Name" value={newRestaurant.name} onChangeText={(value) => updateNewRestaurant('name', value)} editable={!busy} />
          <CategoryPicker value={newRestaurant.category} onChange={(value) => updateNewRestaurant('category', value)} disabled={busy} />
          <View style={styles.row}>
            <Field
              label="Location X"
              value={newRestaurant.locationX}
              onChangeText={(value) => updateNewRestaurant('locationX', value)}
              keyboardType="decimal-pad"
              editable={!busy}
              style={styles.rowField}
            />
            <Field
              label="Location Y"
              value={newRestaurant.locationY}
              onChangeText={(value) => updateNewRestaurant('locationY', value)}
              keyboardType="decimal-pad"
              editable={!busy}
              style={styles.rowField}
            />
          </View>
          <View style={styles.switchRow}>
            <View>
              <AppText weight="700">Promoted</AppText>
              <AppText variant="small" muted>Show as a promoted restaurant.</AppText>
            </View>
            <Switch
              value={newRestaurant.promoted}
              onValueChange={(value) => updateNewRestaurant('promoted', value)}
              disabled={busy}
              trackColor={{ false: theme.border, true: theme.brandSoft }}
              thumbColor={newRestaurant.promoted ? theme.brand : theme.muted}
            />
          </View>
          <ImageField title="Restaurant image" picker={createRestaurantImage} disabled={busy} />
          <Button title={busy ? 'Saving...' : 'Create restaurant'} onPress={createRestaurantSubmit} loading={busy} />
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" weight="800">My restaurants</AppText>
          <AppText muted>{restaurants.length}</AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantTabs}>
          {restaurants.map((restaurant) => {
            const active = restaurant.id === selectedId;
            return (
              <Pressable
                key={restaurant.id}
                onPress={() => setSelectedId(restaurant.id)}
                style={({ pressed }) => [
                  styles.restaurantTab,
                  {
                    backgroundColor: active ? theme.brandSoft : theme.card,
                    borderColor: active ? theme.brand : theme.border,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}
              >
                <AppText weight="800">{restaurant.name}</AppText>
                <AppText variant="small" muted>{restaurant.category || 'Other'}</AppText>
              </Pressable>
            );
          })}
          {!restaurants.length ? <AppText muted>You have not created a restaurant yet.</AppText> : null}
        </ScrollView>

        {selectedRestaurant ? (
          <>
            <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.titleRow}>
                <View style={styles.titleCopy}>
                  <AppText variant="subtitle" weight="800">Edit restaurant</AppText>
                  <AppText variant="small" muted>{selectedRestaurant.name}</AppText>
                </View>
                <Pressable disabled={busy} onPress={confirmDeleteRestaurant}>
                  <AppText color={theme.danger} weight="700">Delete</AppText>
                </Pressable>
              </View>

              <Field label="Name" value={restaurantForm.name} onChangeText={(value) => updateRestaurantForm('name', value)} editable={!busy} />
              <CategoryPicker value={restaurantForm.category} onChange={(value) => updateRestaurantForm('category', value)} disabled={busy} />
              <View style={styles.row}>
                <Field
                  label="Location X"
                  value={restaurantForm.locationX}
                  onChangeText={(value) => updateRestaurantForm('locationX', value)}
                  keyboardType="decimal-pad"
                  editable={!busy}
                  style={styles.rowField}
                />
                <Field
                  label="Location Y"
                  value={restaurantForm.locationY}
                  onChangeText={(value) => updateRestaurantForm('locationY', value)}
                  keyboardType="decimal-pad"
                  editable={!busy}
                  style={styles.rowField}
                />
              </View>
              <View style={styles.switchRow}>
                <View>
                  <AppText weight="700">Promoted</AppText>
                  <AppText variant="small" muted>Controls the promoted flag in the catalog.</AppText>
                </View>
                <Switch
                  value={restaurantForm.promoted}
                  onValueChange={(value) => updateRestaurantForm('promoted', value)}
                  disabled={busy}
                  trackColor={{ false: theme.border, true: theme.brandSoft }}
                  thumbColor={restaurantForm.promoted ? theme.brand : theme.muted}
                />
              </View>
              <ImageField title="Restaurant image" picker={editRestaurantImage} disabled={busy} />
              <Button title="Save restaurant" onPress={saveRestaurantSubmit} loading={busy} />
            </View>

            <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <AppText variant="subtitle" weight="800">Add dish</AppText>
              <Field label="Dish name" value={newProduct.name} onChangeText={(value) => updateNewProduct('name', value)} editable={!busy} />
              <Field
                label="Description"
                value={newProduct.description}
                onChangeText={(value) => updateNewProduct('description', value)}
                editable={!busy}
              />
              <Field
                label="Price"
                value={newProduct.price}
                onChangeText={(value) => updateNewProduct('price', value)}
                keyboardType="decimal-pad"
                editable={!busy}
              />
              <ImageField title="Dish image" picker={createProductImage} disabled={busy} />
              <Button title="Add dish" onPress={createProductSubmit} loading={busy} />
            </View>

            <View style={styles.sectionHeader}>
              <AppText variant="subtitle" weight="800">Menu</AppText>
              <AppText muted>{products.length} {products.length === 1 ? 'dish' : 'dishes'}</AppText>
            </View>
            {products.map((product) => {
              const editing = product.id === editingProductId;
              return (
                <View key={product.id} style={[styles.product, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.productImage, styles.productImageEmpty, { backgroundColor: theme.surface }]}>
                      <AppText muted>No image</AppText>
                    </View>
                  )}
                  <View style={styles.productBody}>
                    <View style={styles.titleRow}>
                      <View style={styles.titleCopy}>
                        <AppText weight="800">{product.name}</AppText>
                        <AppText variant="small" muted>{product.description || 'No description'}</AppText>
                      </View>
                      <AppText weight="800">{formatPrice(product.price)}</AppText>
                    </View>
                    <View style={styles.productActions}>
                      <Button
                        title={editing ? 'Close' : 'Edit'}
                        variant="secondary"
                        onPress={() => setEditingProductId(editing ? null : product.id)}
                        disabled={busy}
                        style={styles.smallButton}
                      />
                      <Button
                        title="Remove"
                        variant="secondary"
                        onPress={() => confirmDeleteProduct(product)}
                        disabled={busy}
                        style={styles.smallButton}
                      />
                    </View>

                    {editing ? (
                      <View style={styles.editor}>
                        <Field label="Dish name" value={editingProduct.name} onChangeText={(value) => updateEditingProduct('name', value)} editable={!busy} />
                        <Field
                          label="Description"
                          value={editingProduct.description}
                          onChangeText={(value) => updateEditingProduct('description', value)}
                          editable={!busy}
                        />
                        <Field
                          label="Price"
                          value={editingProduct.price}
                          onChangeText={(value) => updateEditingProduct('price', value)}
                          keyboardType="decimal-pad"
                          editable={!busy}
                        />
                        <ImageField title="Dish image" picker={editProductImage} disabled={busy} />
                        <Button title="Save dish" onPress={saveProductSubmit} loading={busy} />
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
            {!products.length ? (
              <View style={[styles.empty, { borderColor: theme.border }]}>
                <AppText weight="800">No dishes yet</AppText>
                <AppText muted>Add a dish to make this restaurant orderable.</AppText>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  header: { gap: 5 },
  section: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  titleCopy: { flex: 1, gap: 3 },
  row: { flexDirection: 'row', gap: 10 },
  rowField: { flex: 1 },
  label: { marginBottom: 6 },
  categoryWrap: { gap: 6 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: { borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  imageBlock: { gap: 8 },
  imagePicker: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  preview: { width: '100%', height: 150 },
  previewEmpty: { height: 94, alignItems: 'center', justifyContent: 'center' },
  imageActions: { flexDirection: 'row', gap: 8 },
  smallButton: { height: 40, flex: 1 },
  restaurantTabs: { gap: 10, alignItems: 'center' },
  restaurantTab: { width: 190, minHeight: 74, borderWidth: 1, borderRadius: 12, padding: 12, justifyContent: 'center', gap: 4 },
  product: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  productImage: { width: '100%', height: 150 },
  productImageEmpty: { alignItems: 'center', justifyContent: 'center' },
  productBody: { padding: 14, gap: 10 },
  productActions: { flexDirection: 'row', gap: 8 },
  editor: { gap: 8, marginTop: 4 },
  empty: { borderWidth: 1, borderRadius: 14, padding: 18, alignItems: 'center', gap: 6 },
  banner: { borderWidth: 1, borderRadius: 10, padding: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { textAlign: 'center', marginTop: 8 },
  centerButton: { alignSelf: 'stretch', marginTop: 16 },
});

export default ManageScreen;
