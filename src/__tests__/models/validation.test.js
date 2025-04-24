const Joi = require('joi');
const {
  orderSchema,
  idSchema,
  searchSchema,
  dateFilterSchema
} = require('../../middleware/validationSchemas');

describe('Validation Schemas', () => {
  describe('Order Schema Validation', () => {
    it('should validate a valid order object', () => {
      const validOrder = {
        customer_name: 'Test Customer',
        order_date: new Date(),
        products: [
          {
            product_name: 'Test Product',
            qty: 2,
            price: 100
          }
        ]
      };
      
      const { error } = orderSchema.validate(validOrder);
      expect(error).toBeUndefined();
    });
    
    it('should reject an order without customer_name', () => {
      const invalidOrder = {
        order_date: new Date(),
        products: [
          {
            product_name: 'Test Product',
            qty: 2,
            price: 100
          }
        ]
      };
      
      const { error } = orderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Customer name is required');
    });
    
    it('should reject an order without products', () => {
      const invalidOrder = {
        customer_name: 'Test Customer',
        order_date: new Date(),
        products: []
      };
      
      const { error } = orderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('At least one product is required');
    });
    
    it('should reject an order with invalid product data', () => {
      const invalidOrder = {
        customer_name: 'Test Customer',
        order_date: new Date(),
        products: [
          {
            product_name: 'Test Product',
            qty: 0, // Invalid qty (should be at least 1)
            price: 100
          }
        ]
      };
      
      const { error } = orderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Quantity must be at least 1');
    });
  });
  
  describe('ID Schema Validation', () => {
    it('should validate a valid MongoDB ObjectId', () => {
      const validId = {
        id: '507f1f77bcf86cd799439011' // Valid MongoDB ObjectId format
      };
      
      const { error } = idSchema.validate(validId);
      expect(error).toBeUndefined();
    });
    
    it('should reject an invalid MongoDB ObjectId', () => {
      const invalidId = {
        id: 'invalid-id'
      };
      
      const { error } = idSchema.validate(invalidId);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('ID must be a valid MongoDB ObjectId');
    });
  });
  
  describe('Search Schema Validation', () => {
    it('should validate a valid search query', () => {
      const validSearch = {
        order_no: 'INV20250424001'
      };
      
      const { error } = searchSchema.validate(validSearch);
      expect(error).toBeUndefined();
    });
    
    it('should reject a search query without order_no', () => {
      const invalidSearch = {};
      
      const { error } = searchSchema.validate(invalidSearch);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Order number is required');
    });
  });
  
  describe('Date Filter Schema Validation', () => {
    it('should validate a valid date range filter', () => {
      const validFilter = {
        start_date: new Date('2025-04-01'),
        end_date: new Date('2025-04-30')
      };
      
      const { error } = dateFilterSchema.validate(validFilter);
      expect(error).toBeUndefined();
    });
    
    it('should reject a filter with missing start_date', () => {
      const invalidFilter = {
        end_date: new Date('2025-04-30')
      };
      
      const { error } = dateFilterSchema.validate(invalidFilter);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Start date is required');
    });
    
    it('should reject a filter with end_date before start_date', () => {
      const invalidFilter = {
        start_date: new Date('2025-04-30'),
        end_date: new Date('2025-04-01')
      };
      
      const { error } = dateFilterSchema.validate(invalidFilter);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('End date must be greater than or equal to start date');
    });
  });
});
