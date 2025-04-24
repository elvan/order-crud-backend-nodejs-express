const mongoose = require('mongoose');
const Order = require('../../models/orderModel');
const OrderProduct = require('../../models/orderProductModel');
require('../config/testSetup');

describe('Order Model Test', () => {
  it('should create and save an order successfully', async () => {
    const validOrder = new Order({
      order_no: 'INV202504240001',
      customer_name: 'Test Customer',
      order_date: new Date(),
      grand_total: 1250
    });
    
    const savedOrder = await validOrder.save();
    
    // Check the saved order
    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.order_no).toBe('INV202504240001');
    expect(savedOrder.customer_name).toBe('Test Customer');
    expect(savedOrder.grand_total).toBe(1250);
  });
  
  it('should fail to save an order without required fields', async () => {
    const orderWithoutRequiredField = new Order({
      order_no: 'INV202504240002',
      // Missing customer_name
      order_date: new Date()
    });
    
    let error;
    try {
      await orderWithoutRequiredField.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.customer_name).toBeDefined();
  });
  
  it('should fail to save an order with duplicate order number', async () => {
    // Create first order with unique order_no
    await new Order({
      order_no: 'INV202504240003',
      customer_name: 'Test Customer 1',
      order_date: new Date(),
      grand_total: 1000
    }).save();
    
    // Try to create second order with the same order_no
    const duplicateOrder = new Order({
      order_no: 'INV202504240003', // Same order_no
      customer_name: 'Test Customer 2',
      order_date: new Date(),
      grand_total: 1500
    });
    
    let error;
    try {
      await duplicateOrder.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });
  
  it('should retrieve order with its products using virtual', async () => {
    // Create an order
    const order = await new Order({
      order_no: 'INV202504240004',
      customer_name: 'Test Customer',
      order_date: new Date(),
      grand_total: 1500
    }).save();
    
    // Create order products associated with the order
    await new OrderProduct({
      order_id: order._id,
      product_name: 'Test Product 1',
      qty: 2,
      price: 500,
      subtotal: 1000
    }).save();
    
    await new OrderProduct({
      order_id: order._id,
      product_name: 'Test Product 2',
      qty: 1,
      price: 500,
      subtotal: 500
    }).save();
    
    // Retrieve order with its products
    const retrievedOrder = await Order.findById(order._id).populate('products');
    
    expect(retrievedOrder).toBeDefined();
    expect(retrievedOrder.products).toBeDefined();
    expect(retrievedOrder.products.length).toBe(2);
    expect(retrievedOrder.products[0].product_name).toBe('Test Product 1');
    expect(retrievedOrder.products[1].product_name).toBe('Test Product 2');
  });
});
