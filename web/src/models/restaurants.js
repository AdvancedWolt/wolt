const { Restaurant } = require('./schemas');

// Maps a Mongoose restaurant document to the EX4 API shape. The schema stores
// `_id` and an `owner` ref; the API has always exposed `id` and `ownerId`, so
// the clients (and tests) stay unchanged.
const formatRestaurant = (restaurant) => {
    if (!restaurant) return null;
    return {
        id: restaurant._id,
        name: restaurant.name,
        category: restaurant.category,
        image: restaurant.image,
        promoted: restaurant.promoted,
        location: restaurant.location ? { x: restaurant.location.x, y: restaurant.location.y } : null,
        ownerId: restaurant.owner
    };
};

// Escapes regex metacharacters so a search query is matched literally.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createRestaurant = async (name, details = {}) => {
    const created = await Restaurant.create({
        name,
        category: details.category || 'Other',
        image: details.image || null,
        promoted: details.promoted === true,
        location: details.location || null,
        owner: details.ownerId
    });

    return formatRestaurant(created);
};

const updateRestaurant = async (id, updates) => {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return null;

    if (updates.name !== undefined) restaurant.name = updates.name;
    if (updates.category !== undefined) restaurant.category = updates.category || 'Other';
    if (updates.image !== undefined) restaurant.image = updates.image || null;
    if (updates.promoted !== undefined) restaurant.promoted = updates.promoted === true;
    if (updates.location !== undefined) restaurant.location = updates.location;
    await restaurant.save();
    return formatRestaurant(restaurant);
};

const deleteRestaurant = async (id) => {
    const deleted = await Restaurant.findByIdAndDelete(id);
    return deleted !== null;
};

// Getters
const getAllRestaurants = async () => {
    const restaurants = await Restaurant.find().lean();
    return restaurants.map(formatRestaurant);
};

const getRestaurantById = async (id) => formatRestaurant(await Restaurant.findById(id).lean());

const isOwnedBy = async (id, userId) => {
    const restaurant = await Restaurant.findById(id).select('owner').lean();
    return restaurant?.owner === userId;
};

// helper for GET /api/search/:query endpoint
const searchRestaurants = async (query) => {
    const restaurants = await Restaurant
        .find({ name: { $regex: escapeRegex(query), $options: 'i' } })
        .lean();
    return restaurants.map(formatRestaurant);
};

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getAllRestaurants,
    getRestaurantById,
    isOwnedBy,
    searchRestaurants
};
