const express = require('express');
const cors = require('cors');
const orderRoutes = require('../../routes/orderRoutes');

// Create a test version of our Express application
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  
  // Routes
  app.use('/api/orders', orderRoutes);
  
  // Error handling middleware
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  });
  
  return app;
};

module.exports = { createTestApp };
