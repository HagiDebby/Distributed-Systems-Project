import React, { useEffect, useState } from 'react';
import { fetchPackages } from '../api';

const PackageList = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getPackages = async () => {
            try {
                const response = await fetchPackages();
                setPackages(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getPackages();
    }, []);

    if (loading) {
        return <div>Loading packages...</div>;
    }

    if (error) {
        return <div>Error fetching packages: {error}</div>;
    }

    return (
        <div>
            <h2>Package List</h2>
            <ul>
                {packages.map(pkg => (
                    <li key={pkg._id}>
                        <h3>{pkg.name}</h3>
                        <p>Product ID: {pkg.prod_id}</p>
                        <p>Status: {pkg.status}</p>
                        <p>Start Date: {new Date(pkg.start_date * 1000).toLocaleString()}</p>
                        <p>ETA: {new Date(pkg.eta * 1000).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PackageList;