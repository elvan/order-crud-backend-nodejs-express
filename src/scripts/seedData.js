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
  const firstNames = ['Budi', 'Dewi', 'Agus', 'Siti', 'Ahmad', 'Rina', 'Dimas', 'Maya', 'Andi', 'Lina', 'Hendra', 'Putri', 'Rudi', 'Wati', 'Bambang'];
  const lastNames = ['Wijaya', 'Kusuma', 'Santoso', 'Purnama', 'Saputra', 'Hidayat', 'Nugraha', 'Permana', 'Wibowo', 'Setiawan', 'Susanto', 'Hermawan', 'Gunawan', 'Suryanto', 'Pratama'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomProduct = () => {
  // Harga produk dalam ribuan Rupiah (dikalikan 1000 nanti)
  const products = [
    { name: 'Laptop ASUS VivoBook', minPrice: 7000, maxPrice: 15000 },
    { name: 'Laptop Lenovo IdeaPad', minPrice: 6500, maxPrice: 14000 },
    { name: 'Laptop Acer Aspire', minPrice: 6000, maxPrice: 13000 },
    { name: 'HP Samsung Galaxy A52', minPrice: 3500, maxPrice: 5000 },
    { name: 'HP Xiaomi Redmi Note 11', minPrice: 2200, maxPrice: 3500 },
    { name: 'HP OPPO A96', minPrice: 2800, maxPrice: 4200 },
    { name: 'HP Vivo Y22', minPrice: 2000, maxPrice: 3200 },
    { name: 'iPad Pro 11', minPrice: 11000, maxPrice: 18000 },
    { name: 'Samsung Galaxy Tab S8', minPrice: 9000, maxPrice: 14000 },
    { name: 'Headphone Sony WH-1000XM4', minPrice: 3800, maxPrice: 4500 },
    { name: 'Headphone Sennheiser HD 450BT', minPrice: 2500, maxPrice: 3200 },
    { name: 'Monitor Samsung 24 inch', minPrice: 1800, maxPrice: 2800 },
    { name: 'Monitor LG 27 inch', minPrice: 2500, maxPrice: 3500 },
    { name: 'Keyboard Logitech K120', minPrice: 120, maxPrice: 200 },
    { name: 'Keyboard Mechanical Rexus', minPrice: 350, maxPrice: 850 },
    { name: 'Mouse Logitech M331', minPrice: 180, maxPrice: 350 },
    { name: 'Mouse Wireless Fantech', minPrice: 150, maxPrice: 320 },
    { name: 'Speaker Bluetooth JBL Go 3', minPrice: 600, maxPrice: 850 },
    { name: 'Printer Canon PIXMA', minPrice: 900, maxPrice: 1800 },
    { name: 'Printer Epson L3210', minPrice: 2200, maxPrice: 2800 },
    { name: 'SSD Samsung 1TB', minPrice: 1300, maxPrice: 1800 },
    { name: 'HDD External Seagate 2TB', minPrice: 800, maxPrice: 1200 }
  ];
  
  const product = products[Math.floor(Math.random() * products.length)];
  
  // Harga dalam Rupiah (dikalikan 1000 untuk mendapatkan harga riil)
  const priceInThousands = Math.floor(Math.random() * (product.maxPrice - product.minPrice + 1) + product.minPrice);
  const price = priceInThousands * 1000;
  
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
