const mongoose = require('mongoose');
const Business = require('./business'); // Assuming your business model file
const Customer = require('./customer'); // Assuming your customer model file
const { validateEpochTimestamp } = require('../validators'); // Your validators file

const packageSchema = new mongoose.Schema({
    prod_id: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Product ID must be at least 3 characters'],
        maxlength: [50, 'Product ID cannot exceed 50 characters']
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    start_date: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) {
                const result = validateEpochTimestamp(v, 'Start date', false, 1);
                return result.success;
            },
            message: 'Start date must be a valid timestamp within the last day'
        }
    },
    eta: {
        type: Number,
        required: true,
        validate: [
            {
                validator: function(v) {
                    const result = validateEpochTimestamp(v, 'ETA', true);
                    return result.success;
                },
                message: 'ETA must be a valid timestamp in the future'
            },
            {
                validator: function(v) {
                    // Validate that ETA is after start_date
                    return v > this.start_date;
                },
                message: 'ETA must be after start date'
            }
        ]
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['packed', 'shipped', 'intransit', 'delivered'],
            message: 'Status must be one of: packed, shipped, intransit, delivered'
        }
    },
    business_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Business',
        validate: {
            validator: async function(value) {
                console.log("Business ID being validated:", value);
                return Business.exists({_id: value});
            },
            message: 'Business with the specified ID does not exist'
        }
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer',
        validate: {
            validator: async function(value) {
                console.log("Customer ID being validated:", value);
                return Customer.exists({_id: value});
            },
            message: 'Customer with the specified ID does not exist'
        }
    },
    path: [{
        lat: {
            type: Number,
            required: true,
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        lon: {
            type: Number,
            required: true,
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        }
    }]
}, { timestamps: true });

// Add index for faster queries on status
packageSchema.index("status");
packageSchema.index({ business_id: 1 }); // For getPackages
packageSchema.index({ customer_id: 1 }); // For customer lookups
packageSchema.index({ status: 1 }); // For status filtering

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;