import React, { useEffect, useState } from 'react';
import PackageList from '../components/PackageList';
import { fetchPackages } from '../api';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getPackages = async () => {
            try {
                const data = await fetchPackages();
                setPackages(data);
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
            <h1>Packages</h1>
            <PackageList packages={packages} />
        </div>
    );
};

export default Packages;