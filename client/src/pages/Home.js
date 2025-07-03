import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>Welcome to the Delivery Handling Application</h1>
            <p>This application allows you to manage businesses, customers, and packages efficiently.</p>
            <h2>Navigation</h2>
            <ul>
                <li><Link to="/businesses">View Businesses</Link></li>
                <li><Link to="/customers">View Customers</Link></li>
                <li><Link to="/packages">View Packages</Link></li>
            </ul>
        </div>
    );
};

export default Home;