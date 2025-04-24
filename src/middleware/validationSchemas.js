const Joi = require('joi');

/**
 * Validation schemas for order API endpoints
 */

// Schema for order product validation
const orderProductSchema = Joi.object({
  product_name: Joi.string().trim().required()
    .messages({
      'string.empty': 'Product name is required',
      'any.required': 'Product name is required'
    }),
  qty: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
  price: Joi.number().min(0).required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    })
});

// Schema for creating/updating order
const orderSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
    .messages({
      'string.pattern.base': 'ID must be a valid MongoDB ObjectId'
    }),
  customer_name: Joi.string().trim().required()
    .messages({
      'string.empty': 'Customer name is required',
      'any.required': 'Customer name is required'
    }),
  order_date: Joi.date().required()
    .messages({
      'date.base': 'Order date must be a valid date',
      'any.required': 'Order date is required'
    }),
  products: Joi.array().items(orderProductSchema).min(1).required()
    .messages({
      'array.base': 'Products must be an array',
      'array.min': 'At least one product is required',
      'any.required': 'Products are required'
    })
});

// Schema for order ID validation
const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
      'any.required': 'ID is required'
    })
});

// Schema for search by order_no
const searchSchema = Joi.object({
  order_no: Joi.string().trim().required()
    .messages({
      'string.empty': 'Order number is required for search',
      'any.required': 'Order number is required for search'
    }),
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid('order_no', 'customer_name', 'order_date', 'grand_total').optional(),
  dir: Joi.string().valid('asc', 'desc').optional()
}).options({ stripUnknown: true }); // Ignore unknown query parameters

// Schema for date range filter
const dateFilterSchema = Joi.object({
  start_date: Joi.date().required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
  end_date: Joi.date().required().min(Joi.ref('start_date'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be greater than or equal to start date',
      'any.required': 'End date is required'
    }),
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid('order_no', 'customer_name', 'order_date', 'grand_total').optional(),
  dir: Joi.string().valid('asc', 'desc').optional()
}).options({ stripUnknown: true }); // Ignore unknown query parameters

// Schema for pagination and sorting
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid('order_no', 'customer_name', 'order_date', 'grand_total').optional()
    .messages({
      'any.only': 'Sort field must be one of: order_no, customer_name, order_date, grand_total'
    }),
  dir: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort direction must be either asc or desc'
    })
}).options({ stripUnknown: true });

module.exports = {
  orderSchema,
  idSchema,
  searchSchema,
  dateFilterSchema,
  paginationSchema
};
