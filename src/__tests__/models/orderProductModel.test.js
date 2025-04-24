const mongoose = require('mongoose');
const OrderProduct = require('../../models/orderProductModel');
const Order = require('../../models/orderModel');
require('../config/testSetup');

describe('OrderProduct Model Test', () => {
  let testOrder;
  
  beforeEach(async () => {
    // Create a test order for foreign key reference
    testOrder = await new Order({
      order_no: 'INV202504240005',
      customer_name: 'Test Customer',
      order_date: new Date(),
      grand_total: 0
    }).save();
  });
  
  it('should create and save an order product successfully', async () => {
    const validOrderProduct = new OrderProduct({
      order_id: testOrder._id,
      product_name: 'Test Product',
      qty: 2,
      price: 100,
      subtotal: 200
    });
    
    const savedOrderProduct = await validOrderProduct.save();
    
    // Check the saved order product
    expect(savedOrderProduct._id).toBeDefined();
    expect(savedOrderProduct.product_name).toBe('Test Product');
    expect(savedOrderProduct.qty).toBe(2);
    expect(savedOrderProduct.price).toBe(100);
    expect(savedOrderProduct.subtotal).toBe(200);
    expect(savedOrderProduct.order_id.toString()).toBe(testOrder._id.toString());
  });
  
  it('should auto-calculate subtotal before saving', async () => {
    const orderProduct = new OrderProduct({
      order_id: testOrder._id,
      product_name: 'Auto Calculate Product',
      qty: 3,
      price: 150,
      // Intentionally set incorrect subtotal
      subtotal: 100
    });
    
    const savedOrderProduct = await orderProduct.save();
    
    // The pre-save hook should auto-calculate the correct subtotal (3 * 150 = 450)
    expect(savedOrderProduct.subtotal).toBe(450);
  });
  
  it('should fail to save an order product without required fields', async () => {
    const orderProductWithoutRequiredField = new OrderProduct({
      order_id: testOrder._id,
      // Missing product_name
      qty: 2,
      price: 100
    });
    
    let error;
    try {
      await orderProductWithoutRequiredField.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.product_name).toBeDefined();
  });
  
  it('should fail to save an order product with negative price', async () => {
    const orderProductWithNegativePrice = new OrderProduct({
      order_id: testOrder._id,
      product_name: 'Negative Price Product',
      qty: 2,
      price: -50, // Negative price
      subtotal: 0
    });
    
    let error;
    try {
      await orderProductWithNegativePrice.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.price).toBeDefined();
  });
  
  it('should fail to save an order product with quantity less than 1', async () => {
    const orderProductWithZeroQty = new OrderProduct({
      order_id: testOrder._id,
      product_name: 'Zero Quantity Product',
      qty: 0, // Zero quantity
      price: 100,
      subtotal: 0
    });
    
    let error;
    try {
      await orderProductWithZeroQty.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.qty).toBeDefined();
  });
});
