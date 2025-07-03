// helpers/locationService.js
const axios = require('axios');

/**
 * Get coordinates for an address using LocationIQ API
 * @param {string} address - Full address string
 * @param {string} apiKey - LocationIQ API key
 * @returns {Array} Array of location objects with lat/lon
 */
const getCoordinatesFromAddress = async (address, apiKey) => {
    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodedAddress}&format=json`;

        const response = await axios.get(url);


        // Return all results, each with lat/lon
        return response.data.map(location => ({
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
            display_name: location.display_name,
            place_id: location.place_id
        }));

    } catch (error) {
        console.error('LocationIQ API error:', error.message);
        return [];
    }
};

module.exports = { getCoordinatesFromAddress };