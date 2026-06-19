import { Outlet } from 'react-router-dom';

import Navbar from './Navbar.jsx';

// App frame shared by the main pages: navbar on top, active page below.
const Layout = () => (
    <>
        <Navbar />
        <main className="page">
            <Outlet />
        </main>
    </>
);

export default Layout;
