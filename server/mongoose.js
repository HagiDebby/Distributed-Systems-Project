const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/DeliveryHandlingCompany', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
        console.log('Database indexes created successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

module.exports = mongoose;