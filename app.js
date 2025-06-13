const mongoose = require('mongoose');

// Add this before mongoose.connect
mongoose.set('strictQuery', true);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const healthRecordRoutes = require('./routes/healthRecord.routes');
app.use('/api/health-records', healthRecordRoutes); 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

module.exports = app;