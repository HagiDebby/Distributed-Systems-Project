import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getPackages } from '../api';

const LocationMap = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await getPackages();
                const packages = response.data || [];
                const allLocations = packages.flatMap(pkg => pkg.path);
                setLocations(allLocations);
            } catch (err) {
                setError('Failed to load locations');
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <MapContainer center={[0, 0]} zoom={2} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map((location, index) => (
                <Marker key={index} position={[location.lat, location.lon]}>
                    <Popup>
                        Location: {location.lat}, {location.lon}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default LocationMap;