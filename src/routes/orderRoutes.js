const express = require('express');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  searchOrders,
  filterOrdersByDate,
  exportOrdersToExcel
} = require('../controllers/orderController');
const validate = require('../middleware/validationMiddleware');
const {
  orderSchema,
  idSchema,
  searchSchema,
  dateFilterSchema,
  paginationSchema
} = require('../middleware/validationSchemas');

const router = express.Router();

// Base order route - POST only
router.route('/')
  .get(validate(paginationSchema, 'query'), getOrders)
  .post(validate(orderSchema, 'body'), createOrder);

// Special routes - must be defined BEFORE /:id route to prevent conflicts
// Search and filter routes
router.get('/search', validate(searchSchema, 'query'), searchOrders);
router.get('/filter', validate(dateFilterSchema, 'query'), filterOrdersByDate);

// Export route
router.get('/export/excel', exportOrdersToExcel);

// ID-based routes - must be defined AFTER specific routes
router.route('/:id')
  .get(validate(idSchema, 'params'), getOrderById)
  .put(validate(idSchema, 'params'), validate(orderSchema, 'body'), updateOrder)
  .delete(validate(idSchema, 'params'), deleteOrder);

module.exports = router;
