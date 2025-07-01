// services/customerService.js
const Customer = require('../models/customer');
const { getCoordinatesFromAddress } = require('../helpers/locationService');

/**
 * Create a new customer
 * @param {Object} customerDetails - {name, email, address}
 * @returns {Object} {success: boolean, data?: ObjectId, message?: string}
 */
const createCustomer = async (customerDetails) => {
    try {
        const { name, email, address } = customerDetails;

        // Try to get coordinates for the address
        const fullAddress = `${address.number} ${address.street}, ${address.city}`;
        const coordinates = getCoordinatesFromAddress(fullAddress, process.env.LOCATIONIQ_API_KEY);

        // Use first result if available
        if (coordinates.length > 0) {
            address.lat = coordinates[0].lat;
            address.lon = coordinates[0].lon;
        }

        const customer = new Customer({
            name,
            email,
            address
        });

        const savedCustomer = await customer.save();

        return {
            success: true,
            data: savedCustomer._id,
            message: 'Customer created successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to create customer'
        };
    }
};

/**
 * Get all customers
 * @returns {Array} Array of all customers
 */
const getCustomers = async () => {
    try {
        return await Customer.find({});
    } catch (error) {
        console.error('Error fetching customers:', error.message);
        return [];
    }
};

module.exports = { createCustomer, getCustomers };