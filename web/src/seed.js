const Restaurant = require('./models/restaurants');
const Product = require('./models/products');
const User = require('./models/users');
const Order = require('./models/orders');

// All photos are from Unsplash (Unsplash License: free to use, commercial OK,
// no attribution required). Every URL below was verified to return 200 image/*.
const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;

// Distinct, verified food photos. Keys are descriptive; ids are Unsplash slugs.
const IMG = {
    sushiRolls: img('1579584425555-c3ce17fd4351'),
    sushiPlatter: img('1553621042-f6e147245754'),
    salmonNigiri: img('1579871494447-9811cf80d66c'),
    dumplings: img('1496116218417-1a781b1c416c'),
    prawns: img('1565680018434-b513d5e5fd47'),
    ramen: img('1607330289024-1535c6b4e1c1'),
    spicyRamen: img('1455619452474-d2be8b1e70cd'),
    sweetSour: img('1525755662778-989d0524087e'),

    pizzaWood: img('1513104890138-7c749659a591'),
    pizzaSlice: img('1565299624946-b28f40a0ae38'),
    pizzaOrange: img('1604382354936-07c5d9983bd3'),
    pizzaRustic: img('1594007654729-407eedc4be65'),
    pizzaWhite: img('1593560708920-61dd98c46a4e'),
    pizzaTomato: img('1574071318508-1cdbab80d002'),

    burgerClassic: img('1568901346375-23c9450c58cd'),
    burgerBig: img('1586190848861-99aa4a171e90'),
    burgerStack: img('1481070555726-e2fe8357725c'),
    burgerCheese: img('1565299507177-b0ac66763828'),
    burgerFries: img('1551782450-a2132b4ba21d'),
    burgerBoard: img('1571091718767-18b5b1457add'),
    burgerDouble: img('1572802419224-296b0aeee0d9'),
    burgerStand: img('1550547660-d9450f859349'),
    burgerPlate: img('1499028344343-cd173ffc68a9'),
    chickenBurger: img('1521305916504-4a1121188589'),
    smashFries: img('1551782450-17144efb9c50'),
    fries: img('1576107232684-1279f390859f'),
    sharingTable: img('1466978913421-dad2ebd01d17'),

    pastaSalad: img('1540189549336-e6e99c3679fe'),
    pastaCreamy: img('1551183053-bf91a1d81141'),
    pastaPlated: img('1473093226795-af9932fe5856'),
    porkChop: img('1432139555190-58524dae6a55'),
    lambChops: img('1432139509613-5c4255815697'),
    platedDish: img('1568600891621-50f697b9a1c7'),

    saladBowl: img('1546069901-ba9599a7e63c'),
    greenSalad: img('1473093295043-cdd812d0e601'),
    saladPlate: img('1565895405138-6c3a1555da6a'),
    colourSalad: img('1540420773420-3366772f4999'),
    saladDish: img('1484980972926-edee96e0960d'),
    healthyEggs: img('1490645935967-10de6ba17061'),
    tacos: img('1611250188496-e966043a0629'),
    shrimpBowl: img('1559847844-5315695dadae'),
    mezze: img('1504674900247-0877df9cc836'),
    wrap: img('1626700051175-6818013e1d4f'),
    avocadoToast: img('1482049016688-2d3e1b311543'),

    cake: img('1565958011703-44f9829ba187'),
    pancakes: img('1567620905732-2d1ec7ab7445'),
    dessertPour: img('1551024506-0bccd828d307'),
    miniDesserts: img('1563729784474-d77dbb933a9e'),
    bagel: img('1559054663-e8d23213f55c'),
    frenchToast: img('1484723091739-30a097e8f929'),
    shakshuka: img('1623341214825-9f4f963727da'),
    toastie: img('1528735602780-2552fd46c7af'),
    pestoSandwich: img('1539252554453-80ab65ce3586'),
    mealBoxes: img('1606756790138-261d2b21cd75'),

    // Venue shots, used as hero images for extra variety.
    sushiBar: img('1559339352-11d035aa65de'),
    seaTerrace: img('1414235077428-338989a2e8c0'),
    diner: img('1517248135467-4c7edcad34c4'),
    cafeTerrace: img('1559925393-8be0ec4767c8'),
};

// 30 restaurants, 5 per category. `hero` is unique per restaurant; `menu` lists
// 6 dishes each. Coordinates are varied real-ish Tel Aviv points.
const RESTAURANTS = [
    // --- Sushi ---
    {
        name: 'Sakura Sushi', category: 'Sushi', promoted: true,
        location: { x: 32.0809, y: 34.7806 }, hero: IMG.sushiRolls,
        menu: [
            { name: 'Salmon Sashimi', description: 'Fresh Norwegian salmon, sliced to order', price: 42, image: IMG.salmonNigiri },
            { name: 'Tuna Nigiri', description: 'Seared tuna over seasoned rice', price: 38, image: IMG.sushiPlatter },
            { name: 'Spicy Tuna Roll', description: 'Tuna, cucumber and chilli mayo', price: 36, image: IMG.sushiRolls },
            { name: 'Dragon Roll', description: 'Eel, avocado and tobiko', price: 46, image: IMG.sushiPlatter },
            { name: 'Edamame', description: 'Steamed soy beans, sea salt', price: 18, image: IMG.greenSalad },
            { name: 'Seafood Miso', description: 'Miso broth with prawns and calamari', price: 24, image: IMG.ramen },
        ],
    },
    {
        name: 'Tokyo Bites', category: 'Sushi', promoted: false,
        location: { x: 32.0762, y: 34.7740 }, hero: IMG.sushiPlatter,
        menu: [
            { name: 'Rainbow Roll', description: 'Five fish over avocado maki', price: 48, image: IMG.sushiRolls },
            { name: 'Salmon Avocado Roll', description: 'Classic salmon and ripe avocado', price: 34, image: IMG.salmonNigiri },
            { name: 'Gyoza', description: 'Pan-fried pork and chive dumplings', price: 30, image: IMG.dumplings },
            { name: 'Chicken Ramen', description: 'Rich broth, soft egg and scallion', price: 44, image: IMG.ramen },
            { name: 'Agedashi Tofu', description: 'Crisp tofu in dashi', price: 26, image: IMG.platedDish },
            { name: 'Mango Mochi', description: 'Chewy rice cake, mango cream', price: 22, image: IMG.miniDesserts },
        ],
    },
    {
        name: 'Nori & Rice', category: 'Sushi', promoted: false,
        location: { x: 32.0685, y: 34.7762 }, hero: IMG.salmonNigiri,
        menu: [
            { name: 'Chirashi Bowl', description: 'Assorted sashimi over sushi rice', price: 52, image: IMG.shrimpBowl },
            { name: 'California Roll', description: 'Crab, avocado and cucumber', price: 32, image: IMG.sushiRolls },
            { name: 'Tempura Prawns', description: 'Light batter, four pieces', price: 38, image: IMG.prawns },
            { name: 'Spicy Salmon Don', description: 'Salmon, chilli and sesame rice', price: 46, image: IMG.salmonNigiri },
            { name: 'Miso Soup', description: 'Tofu, wakame and scallion', price: 16, image: IMG.ramen },
            { name: 'Seaweed Salad', description: 'Wakame, sesame and ginger', price: 22, image: IMG.greenSalad },
        ],
    },
    {
        name: 'Umami House', category: 'Sushi', promoted: false,
        location: { x: 32.0931, y: 34.7745 }, hero: IMG.sushiBar,
        menu: [
            { name: 'Omakase Platter', description: "Twelve pieces, chef's selection", price: 58, image: IMG.sushiPlatter },
            { name: 'Black Cod Nigiri', description: 'Miso-glazed cod, two pieces', price: 44, image: IMG.salmonNigiri },
            { name: 'Soft Shell Crab Roll', description: 'Crab, cucumber and spicy mayo', price: 42, image: IMG.sushiRolls },
            { name: 'Pork Gyoza', description: 'Steamed then seared, six pieces', price: 32, image: IMG.dumplings },
            { name: 'Spicy Tonkotsu', description: 'Pork broth ramen with chilli oil', price: 48, image: IMG.spicyRamen },
            { name: 'Yuzu Cheesecake', description: 'Citrus baked cheesecake', price: 28, image: IMG.cake },
        ],
    },
    {
        name: 'Wasabi Bar', category: 'Sushi', promoted: false,
        location: { x: 32.0577, y: 34.7689 }, hero: IMG.dumplings,
        menu: [
            { name: 'Tuna Tataki', description: 'Seared tuna, ponzu and scallion', price: 46, image: IMG.platedDish },
            { name: 'Volcano Roll', description: 'Baked salmon over spicy maki', price: 44, image: IMG.sushiRolls },
            { name: 'Shrimp Tempura Roll', description: 'Crunchy prawn and avocado', price: 40, image: IMG.prawns },
            { name: 'Inari', description: 'Sweet tofu pockets, four pieces', price: 24, image: IMG.sushiPlatter },
            { name: 'Chicken Karaage', description: 'Crisp fried chicken, lemon', price: 34, image: IMG.sweetSour },
            { name: 'Matcha Ice Cream', description: 'Stone-ground green tea', price: 20, image: IMG.miniDesserts },
        ],
    },

    // --- Pizza ---
    {
        name: 'Pizza Madre', category: 'Pizza', promoted: true,
        location: { x: 32.0853, y: 34.7818 }, hero: IMG.pizzaWood,
        menu: [
            { name: 'Margherita', description: 'San Marzano tomato, mozzarella, basil', price: 48, image: IMG.pizzaSlice },
            { name: 'Pepperoni', description: 'Spicy pepperoni and mozzarella', price: 54, image: IMG.pizzaOrange },
            { name: 'Quattro Formaggi', description: 'Four cheeses and a honey drizzle', price: 56, image: IMG.pizzaWhite },
            { name: 'Diavola', description: 'Spicy salami, chilli and garlic', price: 52, image: IMG.pizzaWood },
            { name: 'Garlic Knots', description: 'Warm dough, parsley and parmesan', price: 22, image: IMG.toastie },
            { name: 'Tiramisu', description: 'Espresso-soaked savoiardi', price: 28, image: IMG.cake },
        ],
    },
    {
        name: 'Napoli', category: 'Pizza', promoted: false,
        location: { x: 32.0704, y: 34.7790 }, hero: IMG.pizzaSlice,
        menu: [
            { name: 'Marinara', description: 'Tomato, garlic and oregano', price: 44, image: IMG.pizzaWood },
            { name: 'Prosciutto e Rucola', description: 'Cured ham, rocket and parmesan', price: 58, image: IMG.pizzaRustic },
            { name: 'Calzone', description: 'Folded pizza, ricotta and spinach', price: 50, image: IMG.pizzaTomato },
            { name: 'Funghi', description: 'Mushroom, mozzarella and thyme', price: 50, image: IMG.pizzaOrange },
            { name: 'Bruschetta', description: 'Tomato, basil and olive oil', price: 24, image: IMG.avocadoToast },
            { name: 'Panna Cotta', description: 'Vanilla cream, berry coulis', price: 26, image: IMG.miniDesserts },
        ],
    },
    {
        name: 'Forno Centrale', category: 'Pizza', promoted: false,
        location: { x: 32.0768, y: 34.7693 }, hero: IMG.pizzaRustic,
        menu: [
            { name: 'Capricciosa', description: 'Ham, mushroom, artichoke and olives', price: 56, image: IMG.pizzaWood },
            { name: 'Bianca', description: 'White pizza, garlic and rosemary', price: 46, image: IMG.pizzaWhite },
            { name: 'Salsiccia', description: 'Italian sausage and friarielli', price: 54, image: IMG.pizzaSlice },
            { name: 'Margherita DOP', description: 'Buffalo mozzarella and basil', price: 52, image: IMG.pizzaTomato },
            { name: 'Arancini', description: 'Fried risotto balls, three pieces', price: 28, image: IMG.fries },
            { name: 'Affogato', description: 'Gelato drowned in espresso', price: 22, image: IMG.miniDesserts },
        ],
    },
    {
        name: 'Slice Republic', category: 'Pizza', promoted: false,
        location: { x: 32.0619, y: 34.7771 }, hero: IMG.pizzaOrange,
        menu: [
            { name: 'New York Slice', description: 'Wide, foldable, classic cheese', price: 30, image: IMG.pizzaSlice },
            { name: 'BBQ Chicken', description: 'Smoky barbecue, red onion', price: 54, image: IMG.pizzaWood },
            { name: 'Veggie Supreme', description: 'Peppers, onion, olives and corn', price: 50, image: IMG.pizzaRustic },
            { name: 'Hawaiian', description: 'Ham and pineapple, no apologies', price: 48, image: IMG.pizzaWhite },
            { name: 'Loaded Fries', description: 'Cheese, jalapeno and ranch', price: 26, image: IMG.fries },
            { name: 'Brownie', description: 'Warm fudge brownie, vanilla scoop', price: 24, image: IMG.cake },
        ],
    },
    {
        name: 'Crosta', category: 'Pizza', promoted: false,
        location: { x: 32.0883, y: 34.7691 }, hero: IMG.pizzaTomato,
        menu: [
            { name: 'Sourdough Margherita', description: '48-hour dough, tomato and basil', price: 52, image: IMG.pizzaWhite },
            { name: 'Nduja', description: 'Spicy calabrian sausage, stracciatella', price: 60, image: IMG.pizzaOrange },
            { name: 'Pesto Verde', description: 'Basil pesto, mozzarella and pine nuts', price: 54, image: IMG.pizzaSlice },
            { name: 'Tartufo', description: 'Truffle cream, mushroom and parmesan', price: 60, image: IMG.pizzaRustic },
            { name: 'Caprese Salad', description: 'Tomato, mozzarella and basil', price: 32, image: IMG.saladPlate },
            { name: 'Cannoli', description: 'Ricotta cream, candied peel', price: 26, image: IMG.miniDesserts },
        ],
    },

    // --- Burgers ---
    {
        name: 'Burgus', category: 'Burgers', promoted: false,
        location: { x: 32.0700, y: 34.7795 }, hero: IMG.burgerClassic,
        menu: [
            { name: 'Classic Cheeseburger', description: 'Beef, cheddar and pickles', price: 46, image: IMG.burgerCheese },
            { name: 'Bacon Deluxe', description: 'Crispy bacon, caramelised onion', price: 56, image: IMG.burgerBig },
            { name: 'Mushroom Swiss', description: 'Sauteed mushrooms and swiss', price: 52, image: IMG.burgerStack },
            { name: 'Crispy Fries', description: 'Hand-cut and double fried', price: 22, image: IMG.burgerFries },
            { name: 'Onion Rings', description: 'Beer-battered, crunchy', price: 20, image: IMG.smashFries },
            { name: 'Chocolate Shake', description: 'Thick malted chocolate', price: 24, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Smash Bros', category: 'Burgers', promoted: true,
        location: { x: 32.0884, y: 34.7755 }, hero: IMG.burgerBig,
        menu: [
            { name: 'Double Smash', description: 'Two patties, American cheese', price: 58, image: IMG.burgerDouble },
            { name: 'Triple Threat', description: 'Three smashed patties, stacked', price: 68, image: IMG.burgerStack },
            { name: 'Spicy Smash', description: 'Jalapeno, chipotle mayo', price: 56, image: IMG.burgerClassic },
            { name: 'Smash Fries', description: 'Crinkle-cut with house seasoning', price: 24, image: IMG.smashFries },
            { name: 'Buffalo Wings', description: 'Six wings, blue cheese dip', price: 38, image: IMG.sweetSour },
            { name: 'Vanilla Shake', description: 'Madagascar vanilla, whipped top', price: 22, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Patty & Bun', category: 'Burgers', promoted: false,
        location: { x: 32.0741, y: 34.7728 }, hero: IMG.diner,
        menu: [
            { name: 'The Original', description: 'Dry-aged beef, secret sauce', price: 54, image: IMG.burgerClassic },
            { name: 'Halloumi Burger', description: 'Grilled halloumi, tomato and pesto', price: 52, image: IMG.chickenBurger },
            { name: 'Chicken Crunch', description: 'Buttermilk fried chicken, slaw', price: 50, image: IMG.burgerBoard },
            { name: 'Sweet Potato Fries', description: 'Smoky aioli on the side', price: 24, image: IMG.fries },
            { name: 'Mac & Cheese Bites', description: 'Crisp, gooey, six pieces', price: 28, image: IMG.smashFries },
            { name: 'Oreo Shake', description: 'Cookies and cream blend', price: 24, image: IMG.miniDesserts },
        ],
    },
    {
        name: 'Grill & Co', category: 'Burgers', promoted: false,
        location: { x: 32.0596, y: 34.7732 }, hero: IMG.burgerBoard,
        menu: [
            { name: 'Wagyu Burger', description: 'Marbled wagyu, truffle mayo', price: 72, image: IMG.burgerBig },
            { name: 'BBQ Bacon Stack', description: 'Smoky bacon, onion rings, BBQ', price: 60, image: IMG.burgerStand },
            { name: 'Veggie Burger', description: 'Black bean patty, avocado', price: 48, image: IMG.burgerPlate },
            { name: 'Loaded Fries', description: 'Cheese, bacon and scallion', price: 30, image: IMG.smashFries },
            { name: 'Coleslaw', description: 'Creamy cabbage and carrot', price: 16, image: IMG.greenSalad },
            { name: 'Strawberry Shake', description: 'Fresh strawberry, whipped cream', price: 24, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Moo Burgers', category: 'Burgers', promoted: false,
        location: { x: 32.0972, y: 34.7762 }, hero: IMG.burgerStand,
        menu: [
            { name: 'Cheese Lover', description: 'Double cheddar, cheese sauce', price: 54, image: IMG.burgerCheese },
            { name: 'Texas BBQ', description: 'Pulled brisket, pickles and slaw', price: 62, image: IMG.burgerClassic },
            { name: 'Crispy Chicken', description: 'Fried thigh, hot honey', price: 50, image: IMG.chickenBurger },
            { name: 'Curly Fries', description: 'Seasoned and crisp', price: 22, image: IMG.fries },
            { name: 'Sharing Platter', description: 'Two burgers, fries and dips for two', price: 90, image: IMG.sharingTable },
            { name: 'Caramel Sundae', description: 'Soft serve, salted caramel', price: 22, image: IMG.miniDesserts },
        ],
    },

    // --- Italian ---
    {
        name: 'Trattoria Bella', category: 'Italian', promoted: true,
        location: { x: 32.0822, y: 34.7800 }, hero: IMG.pastaCreamy,
        menu: [
            { name: 'Fettuccine Alfredo', description: 'Butter, cream and aged parmesan', price: 52, image: IMG.pastaPlated },
            { name: 'Spaghetti Bolognese', description: 'Slow-cooked beef ragu', price: 50, image: IMG.pastaSalad },
            { name: 'Penne Arrabbiata', description: 'Tomato, garlic and chilli', price: 46, image: IMG.pastaCreamy },
            { name: 'Lasagna', description: 'Layered beef and bechamel', price: 54, image: IMG.platedDish },
            { name: 'Caprese', description: 'Tomato, mozzarella and basil', price: 34, image: IMG.saladPlate },
            { name: 'Tiramisu', description: 'Espresso-soaked savoiardi', price: 28, image: IMG.cake },
        ],
    },
    {
        name: 'Osteria Verde', category: 'Italian', promoted: false,
        location: { x: 32.0667, y: 34.7757 }, hero: IMG.pastaSalad,
        menu: [
            { name: 'Cacio e Pepe', description: 'Pecorino, black pepper, tonnarelli', price: 48, image: IMG.pastaCreamy },
            { name: 'Gnocchi Sorrentina', description: 'Potato gnocchi, tomato and mozzarella', price: 50, image: IMG.pastaPlated },
            { name: 'Risotto ai Funghi', description: 'Porcini risotto, parmesan', price: 54, image: IMG.platedDish },
            { name: 'Osso Buco', description: 'Braised veal shank, gremolata', price: 68, image: IMG.lambChops },
            { name: 'Burrata', description: 'Creamy burrata, heirloom tomato', price: 38, image: IMG.colourSalad },
            { name: 'Panna Cotta', description: 'Vanilla cream, berry coulis', price: 26, image: IMG.miniDesserts },
        ],
    },
    {
        name: 'La Cucina', category: 'Italian', promoted: false,
        location: { x: 32.0793, y: 34.7689 }, hero: IMG.pastaPlated,
        menu: [
            { name: 'Tagliatelle al Tartufo', description: 'Fresh pasta, truffle cream', price: 62, image: IMG.pastaCreamy },
            { name: 'Spaghetti Vongole', description: 'Clams, white wine and parsley', price: 58, image: IMG.pastaSalad },
            { name: 'Ravioli di Ricotta', description: 'Ricotta and spinach, sage butter', price: 52, image: IMG.platedDish },
            { name: 'Pollo Parmigiana', description: 'Breaded chicken, tomato and mozzarella', price: 56, image: IMG.porkChop },
            { name: 'Antipasto', description: 'Cured meats, cheese and olives', price: 42, image: IMG.mezze },
            { name: 'Cannoli', description: 'Ricotta cream, candied peel', price: 26, image: IMG.cake },
        ],
    },
    {
        name: 'Dolce Vita', category: 'Italian', promoted: false,
        location: { x: 32.0908, y: 34.7783 }, hero: IMG.lambChops,
        menu: [
            { name: 'Linguine Gamberi', description: 'Prawns, garlic, chilli and lemon', price: 60, image: IMG.prawns },
            { name: 'Pappardelle Ragu', description: 'Wide ribbons, slow beef ragu', price: 54, image: IMG.pastaSalad },
            { name: 'Saltimbocca', description: 'Veal, prosciutto and sage', price: 66, image: IMG.lambChops },
            { name: 'Eggplant Parmigiana', description: 'Layered aubergine, tomato, parmesan', price: 48, image: IMG.platedDish },
            { name: 'Caesar Salad', description: 'Cos, parmesan and croutons', price: 38, image: IMG.saladDish },
            { name: 'Affogato', description: 'Gelato drowned in espresso', price: 22, image: IMG.miniDesserts },
        ],
    },
    {
        name: 'Pasta Fresca', category: 'Italian', promoted: false,
        location: { x: 32.0548, y: 34.7714 }, hero: IMG.platedDish,
        menu: [
            { name: 'Carbonara', description: 'Guanciale, egg yolk and pecorino', price: 50, image: IMG.pastaCreamy },
            { name: 'Pesto Genovese', description: 'Basil pesto, potato and beans', price: 46, image: IMG.pastaPlated },
            { name: 'Amatriciana', description: 'Guanciale, tomato and pecorino', price: 48, image: IMG.pastaSalad },
            { name: 'Polpette', description: 'Beef meatballs in tomato sugo', price: 42, image: IMG.porkChop },
            { name: 'Garden Salad', description: 'Leaves, tomato and balsamic', price: 30, image: IMG.greenSalad },
            { name: 'Gelato Trio', description: 'Three scoops, daily flavours', price: 24, image: IMG.miniDesserts },
        ],
    },

    // --- Healthy ---
    {
        name: 'Tov HaTeva', category: 'Healthy', promoted: true,
        location: { x: 32.0900, y: 34.7750 }, hero: IMG.saladBowl,
        menu: [
            { name: 'Green Bowl', description: 'Quinoa, avocado, greens and tahini', price: 44, image: IMG.greenSalad },
            { name: 'Mezze Bowl', description: 'Hummus, falafel and roasted veg', price: 40, image: IMG.mezze },
            { name: 'Quinoa Salad', description: 'Herbs, lemon and feta', price: 38, image: IMG.colourSalad },
            { name: 'Fish Tacos', description: 'Grilled fish, slaw and lime', price: 46, image: IMG.tacos },
            { name: 'Shrimp Power Bowl', description: 'Prawns, rice and greens', price: 48, image: IMG.shrimpBowl },
            { name: 'Berry Smoothie', description: 'Banana, berries and oat milk', price: 22, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Greens & Co', category: 'Healthy', promoted: false,
        location: { x: 32.0648, y: 34.7726 }, hero: IMG.greenSalad,
        menu: [
            { name: 'Buddha Bowl', description: 'Chickpea, beet, kale and tahini', price: 44, image: IMG.saladBowl },
            { name: 'Cobb Salad', description: 'Egg, avocado, chicken and greens', price: 46, image: IMG.healthyEggs },
            { name: 'Falafel Plate', description: 'Crisp falafel, salad and tahini', price: 38, image: IMG.mezze },
            { name: 'Rainbow Salad', description: 'Crunchy veg, sesame dressing', price: 40, image: IMG.colourSalad },
            { name: 'Avocado Toast', description: 'Sourdough, egg and chilli flakes', price: 34, image: IMG.avocadoToast },
            { name: 'Green Smoothie', description: 'Spinach, apple and ginger', price: 22, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Fresh Roots', category: 'Healthy', promoted: false,
        location: { x: 32.0712, y: 34.7669 }, hero: IMG.seaTerrace,
        menu: [
            { name: 'Poke Bowl', description: 'Tuna, edamame, mango and rice', price: 48, image: IMG.shrimpBowl },
            { name: 'Caesar Wrap', description: 'Grilled chicken, cos and parmesan', price: 38, image: IMG.wrap },
            { name: 'Beet & Goat Salad', description: 'Roasted beet, walnut and chevre', price: 42, image: IMG.saladPlate },
            { name: 'Veggie Tacos', description: 'Roasted veg, avocado and lime', price: 40, image: IMG.tacos },
            { name: 'Lentil Soup', description: 'Red lentil, cumin and lemon', price: 28, image: IMG.ramen },
            { name: 'Mango Smoothie', description: 'Mango, banana and coconut', price: 22, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Vita Bowl', category: 'Healthy', promoted: false,
        location: { x: 32.0837, y: 34.7672 }, hero: IMG.saladDish,
        menu: [
            { name: 'Acai Bowl', description: 'Berries, banana and granola', price: 34, image: IMG.miniDesserts },
            { name: 'Salmon Salad', description: 'Seared salmon, greens and citrus', price: 50, image: IMG.healthyEggs },
            { name: 'Mediterranean Bowl', description: 'Couscous, halloumi and olives', price: 44, image: IMG.saladBowl },
            { name: 'Chicken Power Bowl', description: 'Grilled chicken, quinoa and veg', price: 46, image: IMG.colourSalad },
            { name: 'Shrimp Bowl', description: 'Garlic prawns over brown rice', price: 48, image: IMG.shrimpBowl },
            { name: 'Protein Shake', description: 'Banana, peanut and whey', price: 24, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Sunrise Kitchen', category: 'Healthy', promoted: false,
        location: { x: 32.0524, y: 34.7702 }, hero: IMG.healthyEggs,
        menu: [
            { name: 'Egg White Bowl', description: 'Egg white, spinach and avocado', price: 38, image: IMG.avocadoToast },
            { name: 'Meal Prep Trio', description: 'Three balanced boxes for the week', price: 52, image: IMG.mealBoxes },
            { name: 'Grilled Veg Wrap', description: 'Roasted veg, hummus and greens', price: 36, image: IMG.wrap },
            { name: 'Tuna Nicoise', description: 'Seared tuna, egg, beans and olives', price: 48, image: IMG.saladPlate },
            { name: 'Roasted Veg Tacos', description: 'Sweet potato, black bean and lime', price: 40, image: IMG.tacos },
            { name: 'Detox Juice', description: 'Cucumber, celery and apple', price: 22, image: IMG.dessertPour },
        ],
    },

    // --- Cafe ---
    {
        name: 'Cafe Noga', category: 'Cafe', promoted: false,
        location: { x: 32.0656, y: 34.7720 }, hero: IMG.cafeTerrace,
        menu: [
            { name: 'Shakshuka', description: 'Eggs poached in spiced tomato', price: 38, image: IMG.shakshuka },
            { name: 'Avocado Toast', description: 'Sourdough, egg and chilli flakes', price: 34, image: IMG.avocadoToast },
            { name: 'Croissant', description: 'Butter, baked fresh daily', price: 16, image: IMG.bagel },
            { name: 'Caprese Toastie', description: 'Tomato, mozzarella and pesto', price: 32, image: IMG.toastie },
            { name: 'Cheesecake', description: 'Baked vanilla, berry compote', price: 30, image: IMG.cake },
            { name: 'Iced Latte', description: 'Double shot over ice', price: 16, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Bakery 21', category: 'Cafe', promoted: true,
        location: { x: 32.0790, y: 34.7772 }, hero: IMG.frenchToast,
        menu: [
            { name: 'French Toast', description: 'Brioche, maple and berries', price: 36, image: IMG.pancakes },
            { name: 'Dutch Pancakes', description: 'Mini poffertjes with icing sugar', price: 34, image: IMG.frenchToast },
            { name: 'Bagel & Lox', description: 'Smoked salmon, cream cheese, capers', price: 42, image: IMG.bagel },
            { name: 'Granola Bowl', description: 'Yoghurt, granola and fruit', price: 30, image: IMG.healthyEggs },
            { name: 'Cinnamon Roll', description: 'Soft, gooey, cream cheese glaze', price: 22, image: IMG.miniDesserts },
            { name: 'Flat White', description: 'Velvety microfoam, double shot', price: 16, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Morning Glory', category: 'Cafe', promoted: false,
        location: { x: 32.0729, y: 34.7704 }, hero: IMG.pancakes,
        menu: [
            { name: 'Stack of Pancakes', description: 'Fluffy buttermilk, maple syrup', price: 38, image: IMG.frenchToast },
            { name: 'Eggs Benedict', description: 'Poached eggs, hollandaise, muffin', price: 42, image: IMG.shakshuka },
            { name: 'Veggie Sandwich', description: 'Pesto, mozzarella and greens', price: 34, image: IMG.pestoSandwich },
            { name: 'Acai Bowl', description: 'Berries, banana and granola', price: 34, image: IMG.miniDesserts },
            { name: 'Banana Bread', description: 'Toasted, salted butter', price: 20, image: IMG.cake },
            { name: 'Cappuccino', description: 'Rich espresso, steamed milk', price: 15, image: IMG.dessertPour },
        ],
    },
    {
        name: 'The Daily Grind', category: 'Cafe', promoted: true,
        location: { x: 32.0851, y: 34.7714 }, hero: IMG.bagel,
        menu: [
            { name: 'Breakfast Bagel', description: 'Egg, cheddar and avocado', price: 36, image: IMG.pestoSandwich },
            { name: 'Shakshuka Verde', description: 'Green herbs, eggs and feta', price: 40, image: IMG.shakshuka },
            { name: 'Club Sandwich', description: 'Chicken, bacon, egg and lettuce', price: 44, image: IMG.toastie },
            { name: 'Chicken Wrap', description: 'Grilled chicken, slaw and aioli', price: 38, image: IMG.wrap },
            { name: 'Carrot Cake', description: 'Walnut sponge, cream cheese frosting', price: 28, image: IMG.cake },
            { name: 'Cold Brew', description: 'Slow-steeped, smooth and bold', price: 18, image: IMG.dessertPour },
        ],
    },
    {
        name: 'Cup & Crumb', category: 'Cafe', promoted: false,
        location: { x: 32.0586, y: 34.7748 }, hero: IMG.miniDesserts,
        menu: [
            { name: 'Quiche Lorraine', description: 'Bacon, egg and gruyere tart', price: 36, image: IMG.platedDish },
            { name: 'Smashed Avo', description: 'Sourdough, feta and dukkah', price: 34, image: IMG.avocadoToast },
            { name: 'Ham & Cheese Toastie', description: 'Melted gruyere, dijon', price: 30, image: IMG.toastie },
            { name: 'Fruit Pancakes', description: 'Berries, banana and cream', price: 36, image: IMG.pancakes },
            { name: 'Lemon Tart', description: 'Zesty curd, torched meringue', price: 26, image: IMG.cake },
            { name: 'Espresso Tonic', description: 'Espresso, tonic and citrus', price: 18, image: IMG.dessertPour },
        ],
    },
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
    { username: 'itai', displayName: 'Itai', location: { x: 32.0631, y: 34.7766 } },
    { username: 'roni', displayName: 'Roni', location: { x: 32.0915, y: 34.7771 } },
    { username: 'gali', displayName: 'Gali', location: { x: 32.0772, y: 34.7681 } },
    { username: 'eden', displayName: 'Eden', location: { x: 32.0568, y: 34.7723 } },
];

// [customerIndex, restaurantIndex, [dishIndices]]. Overlapping orders give the
// recommender strong signal: many customers order multiple dishes from the same
// restaurant, and popular dishes (e.g. Sakura's salmon) recur across customers.
const PURCHASES = [
    [0, 0, [0, 1]], [0, 5, [0, 5]], [0, 20, [0]],
    [1, 0, [0, 2]], [1, 10, [0, 3]], [1, 16, [0]],
    [2, 0, [0, 1]], [2, 11, [0, 2]], [2, 25, [4]],
    [3, 5, [0, 1]], [3, 0, [0]], [3, 20, [3, 5]],
    [4, 11, [0, 3]], [4, 6, [0]], [4, 0, [0]],
    [5, 0, [0, 3]], [5, 26, [0, 1]], [5, 5, [0]],
    [6, 5, [0, 1]], [6, 0, [1]], [6, 21, [0, 4]],
    [7, 25, [0, 2]], [7, 0, [0]], [7, 15, [0, 5]],
    [8, 16, [0, 1]], [8, 10, [0]], [8, 0, [0]],
    [9, 12, [0, 3]], [9, 5, [0]], [9, 27, [0, 1]],
    [10, 20, [0, 4]], [10, 0, [0]], [10, 6, [0, 2]],
    [11, 25, [0, 1]], [11, 11, [0]], [11, 5, [0]],
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
            image: r.hero,
            ownerId: owner.id,
        });
        const products = r.menu.map((dish) => Product.createProduct(created.id, dish));
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
