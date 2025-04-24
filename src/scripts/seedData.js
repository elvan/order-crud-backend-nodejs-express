const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/orderModel');
const OrderProduct = require('../models/orderProductModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/order-crud')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  });

// Random data generators
const getRandomCustomerName = () => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Linda', 'William', 'Patricia'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomProduct = () => {
  const products = [
    { name: 'Laptop', minPrice: 800, maxPrice: 2000 },
    { name: 'Smartphone', minPrice: 200, maxPrice: 1200 },
    { name: 'Tablet', minPrice: 300, maxPrice: 900 },
    { name: 'Headphones', minPrice: 50, maxPrice: 350 },
    { name: 'Monitor', minPrice: 150, maxPrice: 800 },
    { name: 'Keyboard', minPrice: 30, maxPrice: 200 },
    { name: 'Mouse', minPrice: 20, maxPrice: 150 },
    { name: 'Printer', minPrice: 100, maxPrice: 500 },
    { name: 'Speaker', minPrice: 50, maxPrice: 400 },
    { name: 'External Hard Drive', minPrice: 80, maxPrice: 300 }
  ];
  
  const product = products[Math.floor(Math.random() * products.length)];
  const price = Math.floor(Math.random() * (product.maxPrice - product.minPrice + 1) + product.minPrice);
  const qty = Math.floor(Math.random() * 5) + 1;
  
  return {
    product_name: product.name,
    price,
    qty,
    subtotal: price * qty
  };
};

// Generate a single order with random data
const generateOrder = async (index) => {
  const orderDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const dateStr = orderDate.getFullYear().toString() +
    (orderDate.getMonth() + 1).toString().padStart(2, '0') +
    orderDate.getDate().toString().padStart(2, '0');
  
  const seqStr = (index + 1).toString().padStart(3, '0');
  const order_no = `INV${dateStr}${seqStr}`;
  
  // Generate 1-5 products for this order
  const numProducts = Math.floor(Math.random() * 5) + 1;
  const products = [];
  
  for (let i = 0; i < numProducts; i++) {
    products.push(getRandomProduct());
  }
  
  const grand_total = products.reduce((acc, product) => acc + product.subtotal, 0);
  
  // Create order
  const order = await Order.create({
    order_no,
    customer_name: getRandomCustomerName(),
    order_date: orderDate,
    grand_total
  });
  
  // Create order products
  await Promise.all(
    products.map(product => OrderProduct.create({
      order_id: order._id,
      product_name: product.product_name,
      qty: product.qty,
      price: product.price,
      subtotal: product.subtotal
    }))
  );
  
  return order;
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany({});
    await OrderProduct.deleteMany({});
    
    console.log('Previous data cleared. Starting to seed...');
    
    const totalOrders = 5000;
    console.log(`Generating ${totalOrders} orders...`);
    
    // Create orders in batches to avoid memory issues
    const batchSize = 100;
    const batches = Math.ceil(totalOrders / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, totalOrders);
      const batchPromises = [];
      
      for (let j = batchStart; j < batchEnd; j++) {
        batchPromises.push(generateOrder(j));
      }
      
      await Promise.all(batchPromises);
      console.log(`Generated orders ${batchStart + 1} to ${batchEnd} (${Math.round((batchEnd / totalOrders) * 100)}% complete)`);
    }
    
    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedData();
