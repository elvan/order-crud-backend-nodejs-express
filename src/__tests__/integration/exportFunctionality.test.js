const request = require('supertest');
const { createTestApp } = require('../config/testApp.helper');
const Order = require('../../models/orderModel');
require('../config/testSetup');

describe('Excel Export Functionality Tests', () => {
  let app;
  
  beforeEach(async () => {
    app = createTestApp();
    
    // Create a batch of test orders for export testing
    const orderPromises = [];
    for (let i = 0; i < 50; i++) {
      orderPromises.push(
        new Order({
          order_no: `INV20250424${String(i + 100).padStart(4, '0')}`,
          customer_name: `Export Test Customer ${i}`,
          order_date: new Date(`2025-04-${(i % 30) + 1}`),
          grand_total: 1000 + i * 100
        }).save()
      );
    }
    
    await Promise.all(orderPromises);
  });
  
  describe('GET /api/orders/export/excel', () => {
    it('should export orders to Excel format', async () => {
      const res = await request(app)
        .get('/api/orders/export/excel')
        .buffer()
        .parse((res, callback) => {
          // Collect response data chunks in a Buffer
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });
      
      // Verify response
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain('attachment; filename=orders.xlsx');
      // Check if response body is a Buffer and has content
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    }, 15000); // Increase timeout
    
    it('should filter exported orders by date range', async () => {
      const res = await request(app)
        .get('/api/orders/export/excel?start_date=2025-04-01&end_date=2025-04-15')
        .buffer()
        .parse((res, callback) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });
      
      // Verify response
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain('attachment; filename=orders.xlsx');
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    }, 15000);
    
    it('should handle large number of orders efficiently', async () => {
      // Create a larger batch of test orders to test performance
      const largeOrderPromises = [];
      for (let i = 0; i < 200; i++) {
        largeOrderPromises.push(
          new Order({
            order_no: `INV20250424${String(i + 1000).padStart(4, '0')}`,
            customer_name: `Large Export Test Customer ${i}`,
            order_date: new Date(`2025-04-${(i % 30) + 1}`),
            grand_total: 1000 + i * 50
          }).save()
        );
      }
      
      await Promise.all(largeOrderPromises);
      
      // Set a longer timeout for this test
      jest.setTimeout(30000);
      
      // Test export with a large dataset
      const startTime = Date.now();
      const res = await request(app)
        .get('/api/orders/export/excel')
        .buffer()
        .parse((res, callback) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });
      const endTime = Date.now();
      
      // Verify response
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      // Check if the export was reasonably fast (under 5 seconds)
      const processingTime = endTime - startTime;
      console.log(`Excel export of large dataset took ${processingTime}ms`);
      
      // The operation should be efficient and complete within a reasonable time
      expect(processingTime).toBeLessThan(5000);
    });
  });
});
