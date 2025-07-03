import React, { useEffect, useState } from 'react';
import CustomerList from '../components/CustomerList';

const Customers = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Assuming the API call is handled in CustomerList component
                // You can also fetch data here if needed
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Customers</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <CustomerList />
        </div>
    );
};

export default Customers;