const express = require('express');
const cors = require('cors');
const Routes = require('./routes');

const app = express();
const PORT = 3001;

// Middleware

app.use(cors());
app.use(express.json());

// Routes initialization
app.use('/', Routes);

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