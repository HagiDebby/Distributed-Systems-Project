const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
        match: [/^[a-zA-Z\s\-\']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true, // Automatically convert to lowercase
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    address: {
        street: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, 'Street name must be at least 2 characters'],
            maxlength: [100, 'Street name cannot exceed 100 characters']
        },
        number: {
            type: Number,
            required: true,
            min: [1, 'Street number must be positive'],
            max: [99999, 'Street number seems too large']
        },
        city: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, 'City name must be at least 2 characters'],
            maxlength: [50, 'City name cannot exceed 50 characters'],
            match: [/^[a-zA-Z\s\-\']+$/, 'City name contains invalid characters']
        },
        lon: {
            type: Number,
            required: false,
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        },
        lat: {
            type: Number,
            required: false,
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        }
    }
});

customerSchema.index({ email: 1 }); // For unique email lookups

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;