// services/packageService.js
const Package = require('../models/package');
const Business = require('../models/business');

/**
 * Create a new package
 * @param {Object} packageDetails - Package details without path
 * @returns {Object} {success: boolean, data?: ObjectId, message?: string}
 */
const createPackage = async (packageDetails) => {
    try {
        const packageData = new Package({
            ...packageDetails,
            path: [] // Initialize empty path
        });

        const savedPackage = await packageData.save();

        return {
            success: true,
            data: savedPackage._id,
            message: 'Package created successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to create package'
        };
    }
};

/**
 * Add location to package path
 * @param {string} packageId - Package ObjectId
 * @param {Object} locationDetails - {lat, lon}
 * @returns {Object} {success: boolean, message: string}
 */
const addLocationToPackage = async (packageId, locationDetails) => {
    try {
        const { lat, lon } = locationDetails;

        // Validate lat/lon
        if (!lat || !lon || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return {
                success: false,
                message: 'Invalid latitude or longitude values'
            };
        }

        const packageDoc = await Package.findById(packageId);
        if (!packageDoc) {
            return {
                success: false,
                message: 'Package with specified ID does not exist'
            };
        }

        // Check if location already exists in path
        const locationExists = packageDoc.path.some(
            location => Math.abs(location.lat - lat) < 0.0001 && Math.abs(location.lon - lon) < 0.0001
        );

        if (locationExists) {
            return {
                success: false,
                message: 'Location already exists in package path'
            };
        }

        // Add location to end of path
        packageDoc.path.push({ lat, lon });
        await packageDoc.save();

        return {
            success: true,
            message: 'Location added to package path successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to add location to package'
        };
    }
};

/**
 * Get all packages for a company
 * @param {string} companyId - Business ObjectId
 * @returns {Object} {success: boolean, data?: Array, message?: string}
 */
const getPackages = async (companyId) => {
    try {
        // Validate if company exists
        const business = await Business.findById(companyId);
        if (!business) {
            return {
                success: false,
                message: 'Company with specified ID does not exist'
            };
        }

        const packages = await Package.find({ business_id: companyId })
            .populate('business_id', 'name site_url')
            .populate('customer_id', 'name email address');

        return {
            success: true,
            data: packages,
            message: 'Packages retrieved successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to retrieve packages'
        };
    }
};

module.exports = { createPackage, addLocationToPackage, getPackages };