// services/businessService.js
const Business = require('../models/business');

/**
 * Create a new business
 * @param {Object} businessDetails - {name, site_url}
 * @returns {Object} {success: boolean, data?: ObjectId, message?: string}
 */
const createCompany = async (businessDetails) => {
    try {
        const { name, site_url } = businessDetails;

        const business = new Business({
            name,
            site_url
        });

        const savedBusiness = await business.save();

        return {
            success: true,
            data: savedBusiness._id,
            message: 'Business created successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to create business'
        };
    }
};

/**
 * Get all companies
 * @returns {Array} Array of all businesses
 */
const getCompanies = async () => {
    try {
        return await Business.find({});
    } catch (error) {
        console.error('Error fetching companies:', error.message);
        return [];
    }
};

module.exports = { createCompany, getCompanies };