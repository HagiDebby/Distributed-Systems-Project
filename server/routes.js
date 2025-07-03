const express = require('express');
const router = express.Router();
const { createCompany, getCompanies } = require('./services/businessService');
const { createCustomer, getCustomers } = require('./services/customerService');
const { createPackage, addLocationToPackage, getPackages } = require('./services/packageService');

// Business routes
router.post('/business', async (req, res) => {
    const result = await createCompany(req.body);
    res.status(result.success ? 201 : 400).json(result);
});

router.get('/business', async (req, res) => {
    const companies = await getCompanies();
    res.json(companies);
});

// Customer routes
router.post('/customers', async (req, res) => {
    const result = await createCustomer(req.body);
    res.status(result.success ? 201 : 400).json(result);
});

router.get('/customers', async (req, res) => {
    const customers = await getCustomers();
    res.json(customers);
});

// Package routes
router.post('/packages', async (req, res) => {
    const result = await createPackage(req.body);
    res.status(result.success ? 201 : 400).json(result);
});

router.put('/packages/:id/location', async (req, res) => {
    const result = await addLocationToPackage(req.params.id, req.body);
    res.status(result.success ? 200 : 400).json(result);
});

// Change this route to use /business instead of /companies
router.get('/business/:id/packages', async (req, res) => {
    const result = await getPackages(req.params.id);
    res.status(result.success ? 200 : 400).json(result);
});

module.exports = router;