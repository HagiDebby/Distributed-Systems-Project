const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/your_database_name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');

        // Create indexes after successful connection
        const Business = require('./models/business');
        const Customer = require('./models/customer');
        const Package = require('./models/package');

        Business.createIndexes();
        Customer.createIndexes();
        Package.createIndexes();

        console.log('Database indexes created successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

module.exports = mongoose;