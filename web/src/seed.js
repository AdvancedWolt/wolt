const Restaurant = require('./models/restaurants');
const Product = require('./models/products');
const User = require('./models/users');
const Order = require('./models/orders');

// Food photos from Unsplash (Unsplash License: free to use, no attribution
// required). Stored as plain URLs; the client falls back to an initial if a
// photo is ever unreachable.
const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;
const PHOTO = {
    sushi: img('1579584425555-c3ce17fd4351'),
    burger: img('1568901346375-23c9450c58cd'),
    fries: img('1540189549336-e6e99c3679fe'),
    pizza: img('1513104890138-7c749659a591'),
    pizzaAlt: img('1565299624946-b28f40a0ae38'),
    pasta: img('1551183053-bf91a1d81141'),
    salad: img('1546069901-ba9599a7e63c'),
    bowl: img('1565958011703-44f9829ba187'),
    breakfast: img('1432139555190-58524dae6a55'),
    pancakes: img('1567620905732-2d1ec7ab7445'),
    dessert: img('1551024506-0bccd828d307'),
    plate: img('1473093295043-cdd812d0e601'),
};

// One menu per category; every restaurant in a category serves it.
const MENUS = {
    Sushi: [
        { name: 'Salmon Sashimi', description: 'Fresh Norwegian salmon, sliced to order', price: 42, image: PHOTO.sushi },
        { name: 'Tuna Nigiri', description: 'Seared tuna over seasoned rice', price: 38, image: PHOTO.sushi },
        { name: 'Spicy Tuna Roll', description: 'Tuna, cucumber and chilli mayo', price: 36, image: PHOTO.bowl },
        { name: 'Dragon Roll', description: 'Eel, avocado and tobiko', price: 46, image: PHOTO.sushi },
        { name: 'Edamame', description: 'Steamed soy beans, sea salt', price: 18, image: PHOTO.salad },
        { name: 'Seafood Miso', description: 'Miso broth with prawns and calamari', price: 24, image: PHOTO.bowl },
    ],
    Pizza: [
        { name: 'Margherita', description: 'San Marzano tomato, mozzarella, basil', price: 48, image: PHOTO.pizza },
        { name: 'Pepperoni', description: 'Spicy pepperoni and mozzarella', price: 54, image: PHOTO.pizzaAlt },
        { name: 'Quattro Formaggi', description: 'Four cheeses, honey drizzle', price: 56, image: PHOTO.pizza },
        { name: 'Marinara', description: 'Tomato, garlic and oregano', price: 44, image: PHOTO.pizzaAlt },
        { name: 'Calzone', description: 'Folded pizza, ricotta and spinach', price: 50, image: PHOTO.pizza },
        { name: 'Tiramisu', description: 'Espresso-soaked savoiardi', price: 28, image: PHOTO.dessert },
    ],
    Burgers: [
        { name: 'Classic Cheeseburger', description: 'Beef, cheddar and pickles', price: 46, image: PHOTO.burger },
        { name: 'Double Smash', description: 'Two patties, American cheese', price: 58, image: PHOTO.burger },
        { name: 'Halloumi Burger', description: 'Grilled halloumi, tomato and pesto', price: 52, image: PHOTO.burger },
        { name: 'Crispy Fries', description: 'Hand-cut and double fried', price: 22, image: PHOTO.fries },
        { name: 'Sweet Potato Fries', description: 'Smoky aioli on the side', price: 24, image: PHOTO.fries },
        { name: 'Onion Rings', description: 'Beer-battered, crunchy', price: 20, image: PHOTO.fries },
    ],
    Italian: [
        { name: 'Fettuccine Alfredo', description: 'Butter, cream and aged parmesan', price: 52, image: PHOTO.pasta },
        { name: 'Spaghetti Bolognese', description: 'Slow-cooked beef ragù', price: 50, image: PHOTO.pasta },
        { name: 'Penne Arrabbiata', description: 'Tomato, garlic and chilli', price: 46, image: PHOTO.pasta },
        { name: 'Lasagna', description: 'Layered beef and béchamel', price: 54, image: PHOTO.pasta },
        { name: 'Margherita Pizza', description: 'Tomato, mozzarella, basil', price: 48, image: PHOTO.pizza },
        { name: 'Tiramisu', description: 'Espresso-soaked savoiardi', price: 28, image: PHOTO.dessert },
    ],
    Healthy: [
        { name: 'Green Bowl', description: 'Quinoa, avocado, greens and tahini', price: 44, image: PHOTO.salad },
        { name: 'Mezze Bowl', description: 'Hummus, falafel and roasted veg', price: 40, image: PHOTO.bowl },
        { name: 'Quinoa Salad', description: 'Herbs, lemon and feta', price: 38, image: PHOTO.salad },
        { name: 'Acai Bowl', description: 'Berries, banana and granola', price: 34, image: PHOTO.breakfast },
        { name: 'Avocado Toast', description: 'Sourdough, chilli flakes', price: 32, image: PHOTO.breakfast },
        { name: 'Berry Smoothie', description: 'Banana, berries and oat milk', price: 22, image: PHOTO.breakfast },
    ],
    Cafe: [
        { name: 'Shakshuka', description: 'Eggs poached in spiced tomato', price: 38, image: PHOTO.breakfast },
        { name: 'Dutch Pancakes', description: 'Mini poffertjes with icing sugar', price: 34, image: PHOTO.pancakes },
        { name: 'French Toast', description: 'Brioche, maple and berries', price: 36, image: PHOTO.pancakes },
        { name: 'Croissant', description: 'Butter, baked fresh daily', price: 16, image: PHOTO.breakfast },
        { name: 'Cheesecake', description: 'Baked vanilla, berry compote', price: 30, image: PHOTO.dessert },
        { name: 'Iced Latte', description: 'Double shot over ice', price: 16, image: PHOTO.dessert },
    ],
    'Middle Eastern': [
        { name: 'Mezze Platter', description: 'Hummus, labneh, peppers and za’atar', price: 46, image: PHOTO.bowl },
        { name: 'Falafel Plate', description: 'Crisp falafel, salad and tahini', price: 32, image: PHOTO.salad },
        { name: 'Hummus & Pita', description: 'Tahini, olive oil and warm pita', price: 28, image: PHOTO.bowl },
        { name: 'Chicken Shawarma', description: 'Spiced chicken, pickles, amba', price: 44, image: PHOTO.plate },
        { name: 'Sabich', description: 'Aubergine, egg and amba in pita', price: 30, image: PHOTO.salad },
        { name: 'Baklava', description: 'Pistachio and honey', price: 24, image: PHOTO.dessert },
    ],
    Asian: [
        { name: 'Pad Thai', description: 'Rice noodles, peanuts and lime', price: 48, image: PHOTO.plate },
        { name: 'Ramen', description: 'Tonkotsu broth, egg and pork', price: 46, image: PHOTO.bowl },
        { name: 'Poke Bowl', description: 'Tuna, rice, edamame and mango', price: 44, image: PHOTO.bowl },
        { name: 'Spring Rolls', description: 'Crisp veg rolls, sweet chilli', price: 26, image: PHOTO.plate },
        { name: 'Dumplings', description: 'Steamed pork and chive', price: 36, image: PHOTO.plate },
        { name: 'Mango Sticky Rice', description: 'Coconut rice and fresh mango', price: 28, image: PHOTO.dessert },
    ],
};

const RESTAURANTS = [
    { name: 'Sakura Sushi', category: 'Sushi', promoted: true, location: { x: 32.0809, y: 34.7806 } },
    { name: 'Tokyo Bites', category: 'Sushi', promoted: false, location: { x: 32.0762, y: 34.7740 } },
    { name: 'Pizza Madre', category: 'Pizza', promoted: true, location: { x: 32.0853, y: 34.7818 } },
    { name: 'Napoli', category: 'Pizza', promoted: false, location: { x: 32.0704, y: 34.7790 } },
    { name: 'Burgus', category: 'Burgers', promoted: false, location: { x: 32.0700, y: 34.7795 } },
    { name: 'Smash Bros', category: 'Burgers', promoted: true, location: { x: 32.0884, y: 34.7755 } },
    { name: 'Trattoria Bella', category: 'Italian', promoted: false, location: { x: 32.0822, y: 34.7800 } },
    { name: 'Tov HaTeva', category: 'Healthy', promoted: false, location: { x: 32.0900, y: 34.7750 } },
    { name: 'Greens & Co', category: 'Healthy', promoted: false, location: { x: 32.0648, y: 34.7726 } },
    { name: 'Cafe Noga', category: 'Cafe', promoted: false, location: { x: 32.0656, y: 34.7720 } },
    { name: 'Bakery 21', category: 'Cafe', promoted: false, location: { x: 32.0790, y: 34.7772 } },
    { name: 'Levant', category: 'Middle Eastern', promoted: false, location: { x: 32.0735, y: 34.7745 } },
    { name: 'Wok This Way', category: 'Asian', promoted: false, location: { x: 32.0768, y: 34.7812 } },
];

const CUSTOMERS = [
    { username: 'noa', displayName: 'Noa', location: { x: 32.0820, y: 34.7790 } },
    { username: 'yarden', displayName: 'Yarden', location: { x: 32.0710, y: 34.7800 } },
    { username: 'amir', displayName: 'Amir', location: { x: 32.0890, y: 34.7760 } },
    { username: 'tamar', displayName: 'Tamar', location: { x: 32.0660, y: 34.7730 } },
    { username: 'daniel', displayName: 'Daniel', location: { x: 32.0760, y: 34.7740 } },
    { username: 'maya', displayName: 'Maya', location: { x: 32.0805, y: 34.7758 } },
    { username: 'omer', displayName: 'Omer', location: { x: 32.0730, y: 34.7785 } },
    { username: 'shira', displayName: 'Shira', location: { x: 32.0870, y: 34.7740 } },
];

// [customerIndex, restaurantIndex, [dishIndices]] — overlapping orders give the
// recommender plenty of signal (Sakura's salmon is ordered by six customers).
const PURCHASES = [
    [0, 0, [0, 1]], [0, 2, [0]],
    [1, 0, [0, 2]], [1, 4, [0]],
    [2, 0, [0, 1]], [2, 7, [0]],
    [3, 2, [0, 5]], [3, 0, [0]],
    [4, 4, [0, 1]], [4, 9, [0]],
    [5, 0, [0, 3]], [5, 4, [0]],
    [6, 2, [0, 1]], [6, 0, [1]],
    [7, 7, [0, 2]], [7, 0, [0]],
];

const OWNER = {
    username: 'wolt-partners',
    password: 'Partners1',
    displayName: 'AdvancedWolt Partners',
    role: 'restaurant_owner',
    location: { x: 32.0809, y: 34.7806 },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seedDatabase = async () => {
    if (Restaurant.getAllRestaurants().length > 0) return;

    const owner = await User.createUser(OWNER);

    const restaurants = RESTAURANTS.map((r) => {
        const created = Restaurant.createRestaurant(r.name, {
            category: r.category,
            promoted: r.promoted,
            location: r.location,
            image: MENUS[r.category][0].image,
            ownerId: owner.id,
        });
        const products = MENUS[r.category].map((dish) => Product.createProduct(created.id, dish));
        return { id: created.id, products };
    });

    const customers = [];
    for (const customer of CUSTOMERS) {
        customers.push(await User.createUser({ ...customer, password: 'Password1', role: 'customer' }));
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
