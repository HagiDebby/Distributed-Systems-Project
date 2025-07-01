const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'Business name must be at least 2 characters long'],
        maxlength: [100, 'Business name cannot exceed 100 characters'],
        unique: true,
        match: [/^[a-zA-Z0-9\s\.\&\-\']+$/, 'Business name contains invalid characters']
    },
    site_url: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: [200, 'URL cannot exceed 200 characters'],
        match: [/^https?:\/\/.+/, 'URL must start with http:// or https://'],
        validate: {
            validator: function(v) {
                try {
                    new URL(v);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Please enter a valid URL'
        }
    }
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;