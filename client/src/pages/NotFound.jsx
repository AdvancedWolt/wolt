import { Link } from 'react-router-dom';

const NotFound = () => (
    <section className="notfound">
        <p className="notfound-code">404</p>
        <h1>This page isn't on the menu</h1>
        <p className="notfound-text">
            We looked everywhere, but the page you ordered doesn't exist.
        </p>
        <Link className="btn" to="/">Back to home</Link>
    </section>
);

export default NotFound;
