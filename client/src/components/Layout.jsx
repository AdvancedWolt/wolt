import { Outlet } from 'react-router-dom';

import Navbar from './Navbar.jsx';

// Shared frame for the main app: the navbar on top, the active page below.
// <Outlet /> is where the matched child route renders.
const Layout = () => (
    <>
        <Navbar />
        <main className="page">
            <Outlet />
        </main>
    </>
);

export default Layout;
