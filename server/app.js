const express = require('express');
require('./mongoose');
const cors = require('cors');
const Routes = require('./routes');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware

app.use(cors());
app.use(express.json());

// Routes initialization
app.use('/', Routes);

// Client-side static files
app.use(express.static(path.join(__dirname, '../client')));

app.use('/main', express.static(path.join(__dirname, '../client/html/index.html')));
app.use('/list', express.static(path.join(__dirname, '../client/html/list.html')));
app.use('/add_package', express.static(path.join(__dirname, '../client/html/add_package_form.html')));


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`App server running on port ${PORT}`);
});

module.exports = app;