const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Routes = require('./routes/routes');

const app = express();
const PORT = 3001;

// Middleware

app.use(cors());
app.use(express.json());

