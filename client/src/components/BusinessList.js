import React, { useEffect, useState } from 'react';
import { fetchBusinesses } from '../api';

const BusinessList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getBusinesses = async () => {
            try {
                const response = await fetchBusinesses();
                setBusinesses(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getBusinesses();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Business List</h2>
            <ul>
                {businesses.map(business => (
                    <li key={business._id}>
                        <h3>{business.name}</h3>
                        <p>Website: <a href={business.site_url} target="_blank" rel="noopener noreferrer">{business.site_url}</a></p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusinessList;