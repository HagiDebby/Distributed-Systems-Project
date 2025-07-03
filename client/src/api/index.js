import axios from 'axios';

const API_URL = 'http://localhost:3001'; // Adjust the URL as needed

// Business API calls
export const fetchBusinesses = async () => {
    try {
        const response = await axios.get(`${API_URL}/business`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching businesses: ' + error.message);
    }
};

// Customer API calls
export const fetchCustomers = async () => {
    try {
        const response = await axios.get(`${API_URL}/customers`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching customers: ' + error.message);
    }
};

// Package API calls
export const fetchPackages = async (businessId) => {
    try {
        const response = await axios.get(`${API_URL}/business/${businessId}/packages`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching packages: ' + error.message);
    }
};