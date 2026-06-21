import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import RestaurantDetail from './pages/RestaurantDetail.jsx';
import Search from './pages/Search.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Manage from './pages/Manage.jsx';
import ManageAccount from './pages/ManageAccount.jsx';
import NotFound from './pages/NotFound.jsx';

// Browsing is public; ordering and managing sit behind ProtectedRoute.
const App = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/cart" element={<Cart />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/manage" element={<Manage />} />
                <Route path="/manage-account" element={<ManageAccount />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Route>
    </Routes>
);

export default App;
