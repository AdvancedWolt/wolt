import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import RestaurantDetail from './pages/RestaurantDetail.jsx';
import Search from './pages/Search.jsx';
import Orders from './pages/Orders.jsx';
import Manage from './pages/Manage.jsx';

// All routes live here, so nobody else edits this file once it is set.
// - /login and /register stand alone (no navbar).
// - The rest share <Layout> (navbar + page).
// - Browsing is public; ordering and managing sit behind <ProtectedRoute>,
//   which sends logged-out users to /login.
const App = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/search" element={<Search />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/orders" element={<Orders />} />
                <Route path="/manage" element={<Manage />} />
            </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

export default App;
