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

// Base order routes
router.route('/')
  .get(validate(paginationSchema, 'query'), getOrders)
  .post(validate(orderSchema, 'body'), createOrder);

router.route('/:id')
  .get(validate(idSchema, 'params'), getOrderById)
  .put(validate(idSchema, 'params'), validate(orderSchema, 'body'), updateOrder)
  .delete(validate(idSchema, 'params'), deleteOrder);

// Search and filter routes
router.get('/search', validate(searchSchema, 'query'), searchOrders);
router.get('/filter', validate(dateFilterSchema, 'query'), filterOrdersByDate);

// Export route
router.get('/export/excel', exportOrdersToExcel);

module.exports = router;
