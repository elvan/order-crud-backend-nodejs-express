const Joi = require('joi');

/**
 * Validation middleware factory that returns a middleware function
 * @param {Object} schema - Joi schema to validate request against
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (!error) return next();
    
    const errors = error.details.map(detail => ({
      field: detail.context.key,
      message: detail.message.replace(/['"]/g, '')
    }));
    
    res.status(400).json({ 
      message: 'Validation error', 
      errors
    });
  };
};

module.exports = validate;
