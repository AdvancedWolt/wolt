const Restaurant = require('./models/restaurants');
const Product = require('./models/products');
const User = require('./models/users');
const Order = require('./models/orders');

// Food photos from Unsplash (Unsplash License: free to use, no attribution
// required). Stored as plain URLs; the client loads them and falls back to an
// initial if they are ever unreachable.
const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;
const PHOTO = {
    sushi: img('1579584425555-c3ce17fd4351'),
    burger: img('1568901346375-23c9450c58cd'),
    fries: img('1540189549336-e6e99c3679fe'),
    pizza: img('1513104890138-7c749659a591'),
    pasta: img('1551183053-bf91a1d81141'),
    salad: img('1546069901-ba9599a7e63c'),
    bowl: img('1565958011703-44f9829ba187'),
    breakfast: img('1432139555190-58524dae6a55'),
    pancakes: img('1567620905732-2d1ec7ab7445'),
    dessert: img('1551024506-0bccd828d307'),
};

const OWNER = {
    username: 'wolt-partners',
    password: 'Partners1',
    displayName: 'AdvancedWolt Partners',
    role: 'restaurant_owner',
    location: { x: 32.0809, y: 34.7806 },
};

// Real Tel Aviv locations; small, illustrative menus.
const RESTAURANTS = [
    {
        name: 'Sakura Sushi', category: 'Sushi', promoted: true, location: { x: 32.0809, y: 34.7806 }, image: PHOTO.sushi,
        menu: [
            { name: 'Salmon Sashimi', description: 'Fresh Norwegian salmon, sliced to order', price: 42, image: PHOTO.sushi },
            { name: 'Spicy Prawn Roll', description: 'Prawn, avocado and chilli mayo', price: 38, image: PHOTO.bowl },
            { name: 'Seafood Miso', description: 'Miso broth with prawns and calamari', price: 24, image: PHOTO.salad },
        ],
    },
    {
        name: 'Burgus', category: 'Burgers', promoted: false, location: { x: 32.0700, y: 34.7795 }, image: PHOTO.burger,
        menu: [
            { name: 'Halloumi Burger', description: 'Grilled halloumi, tomato and pesto', price: 54, image: PHOTO.burger },
            { name: 'Double Smash', description: 'Two beef patties, cheddar and pickles', price: 58, image: PHOTO.burger },
            { name: 'Crispy Fries', description: 'Hand-cut and double fried', price: 22, image: PHOTO.fries },
        ],
    },
    {
        name: 'Pasta Madre', category: 'Italian', promoted: true, location: { x: 32.0853, y: 34.7818 }, image: PHOTO.pizza,
        menu: [
            { name: 'Fettuccine Alfredo', description: 'Butter, cream and aged parmesan', price: 52, image: PHOTO.pasta },
            { name: 'Margherita Pizza', description: 'San Marzano tomato, mozzarella, basil', price: 48, image: PHOTO.pizza },
            { name: 'Tiramisu', description: 'Espresso-soaked savoiardi', price: 28, image: PHOTO.dessert },
        ],
    },
    {
        name: 'Tov HaTeva', category: 'Healthy', promoted: false, location: { x: 32.0900, y: 34.7750 }, image: PHOTO.salad,
        menu: [
            { name: 'Green Bowl', description: 'Quinoa, avocado, greens and tahini', price: 44, image: PHOTO.salad },
            { name: 'Mezze Bowl', description: 'Hummus, falafel and roasted veg', price: 40, image: PHOTO.bowl },
            { name: 'Acai Bowl', description: 'Berries, banana and granola', price: 34, image: PHOTO.breakfast },
        ],
    },
    {
        name: 'Cafe Noga', category: 'Cafe', promoted: false, location: { x: 32.0650, y: 34.7720 }, image: PHOTO.breakfast,
        menu: [
            { name: 'Shakshuka', description: 'Eggs poached in spiced tomato', price: 38, image: PHOTO.breakfast },
            { name: 'Dutch Pancakes', description: 'Mini poffertjes with icing sugar', price: 34, image: PHOTO.pancakes },
            { name: 'Cheesecake', description: 'Baked vanilla, berry compote', price: 30, image: PHOTO.dessert },
        ],
    },
    {
        name: 'Levant', category: 'Middle Eastern', promoted: false, location: { x: 32.0735, y: 34.7745 }, image: PHOTO.bowl,
        menu: [
            { name: 'Mezze Platter', description: 'Hummus, labneh, peppers and za’atar', price: 46, image: PHOTO.bowl },
            { name: 'Falafel Plate', description: 'Crisp falafel, salad and tahini', price: 32, image: PHOTO.salad },
            { name: 'Baklava', description: 'Pistachio and honey', price: 24, image: PHOTO.dessert },
        ],
    },
];

const CUSTOMERS = [
    { username: 'noa', password: 'Password1', displayName: 'Noa', location: { x: 32.0820, y: 34.7790 } },
    { username: 'yarden', password: 'Password1', displayName: 'Yarden', location: { x: 32.0710, y: 34.7800 } },
    { username: 'amir', password: 'Password1', displayName: 'Amir', location: { x: 32.0890, y: 34.7760 } },
    { username: 'tamar', password: 'Password1', displayName: 'Tamar', location: { x: 32.0660, y: 34.7730 } },
    { username: 'daniel', password: 'Password1', displayName: 'Daniel', location: { x: 32.0760, y: 34.7740 } },
];

// [customerIndex, restaurantIndex, [dishIndices]] — overlapping orders give the
// recommender enough signal to suggest dishes from the first visit onward.
const PURCHASES = [
    [0, 0, [0, 1]], [0, 2, [0]],
    [1, 0, [0, 2]], [1, 1, [0]],
    [2, 0, [0, 1]], [2, 3, [0]],
    [3, 2, [0, 1]], [3, 0, [0]],
    [4, 1, [0, 1]], [4, 4, [1]],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seedDatabase = async () => {
    if (Restaurant.getAllRestaurants().length > 0) return;

    const owner = await User.createUser(OWNER);

    const restaurants = RESTAURANTS.map((r) => {
        const created = Restaurant.createRestaurant(r.name, {
            category: r.category,
            promoted: r.promoted,
            location: r.location,
            image: r.image,
            ownerId: owner.id,
        });
        const products = r.menu.map((dish) => Product.createProduct(created.id, dish));
        return { id: created.id, products };
    });

    const customers = [];
    for (const customer of CUSTOMERS) {
        customers.push(await User.createUser({ ...customer, role: 'customer' }));
    }

    for (const [ci, ri, dishes] of PURCHASES) {
        const items = dishes.map((di) => restaurants[ri].products[di].id);
        Order.createOrder(customers[ci].id, restaurants[ri].id, items);

        // Feed the C++ recommender, retrying briefly in case it is still starting.
        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                await User.addViews(customers[ci].id, items);
                break;
            } catch (err) {
                await sleep(500);
            }
        }
    }
};

module.exports = { seedDatabase };
