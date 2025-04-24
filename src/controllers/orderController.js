const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const OrderProduct = require('../models/orderProductModel');
const { generateOrderNumber } = require('../utils/orderNumberGenerator');
const ExcelJS = require('exceljs');

/**
 * @desc    Get all orders with pagination and sorting
 * @route   GET /api/orders
 * @access  Public
 */
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const { sort, dir } = req.query;

  // Configure sorting
  let sortOption = { createdAt: -1 }; // Default sort
  if (sort && dir) {
    sortOption = { [sort]: dir === 'asc' ? 1 : -1 };
  }

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

/**
 * @desc    Get order by ID with its products
 * @route   GET /api/orders/:id
 * @access  Public
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('products');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Create a new order with products
 * @route   POST /api/orders
 * @access  Public
 */
const createOrder = asyncHandler(async (req, res) => {
  const { customer_name, order_date, products } = req.body;

  if (!customer_name || !order_date || !products || products.length === 0) {
    res.status(400);
    throw new Error('Please provide all required fields and at least one product');
  }

  // Generate order number
  const order_no = await generateOrderNumber();

  // Calculate grand total from products
  const grand_total = products.reduce((acc, product) => acc + (product.price * product.qty), 0);

  // Create order
  const order = await Order.create({
    order_no,
    customer_name,
    order_date,
    grand_total
  });

  if (order) {
    // Create order products
    const orderProducts = await Promise.all(
      products.map(product => OrderProduct.create({
        order_id: order._id,
        product_name: product.product_name,
        qty: product.qty,
        price: product.price,
        subtotal: product.qty * product.price
      }))
    );

    res.status(201).json({
      _id: order._id,
      order_no: order.order_no,
      customer_name: order.customer_name,
      order_date: order.order_date,
      grand_total: order.grand_total,
      products: orderProducts
    });
  } else {
    res.status(400);
    throw new Error('Invalid order data');
  }
});

/**
 * @desc    Update an existing order and its products
 * @route   PUT /api/orders/:id
 * @access  Public
 */
const updateOrder = asyncHandler(async (req, res) => {
  const { customer_name, order_date, products } = req.body;

  if (!customer_name || !order_date || !products || products.length === 0) {
    res.status(400);
    throw new Error('Please provide all required fields and at least one product');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Calculate grand total from products
  const grand_total = products.reduce((acc, product) => acc + (product.price * product.qty), 0);

  // Update order
  order.customer_name = customer_name;
  order.order_date = order_date;
  order.grand_total = grand_total;

  const updatedOrder = await order.save();

  // Delete existing order products
  await OrderProduct.deleteMany({ order_id: order._id });

  // Create new order products
  const orderProducts = await Promise.all(
    products.map(product => OrderProduct.create({
      order_id: order._id,
      product_name: product.product_name,
      qty: product.qty,
      price: product.price,
      subtotal: product.qty * product.price
    }))
  );

  res.json({
    _id: updatedOrder._id,
    order_no: updatedOrder.order_no,
    customer_name: updatedOrder.customer_name,
    order_date: updatedOrder.order_date,
    grand_total: updatedOrder.grand_total,
    products: orderProducts
  });
});

/**
 * @desc    Delete an order and its products
 * @route   DELETE /api/orders/:id
 * @access  Public
 */
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Delete order products
  await OrderProduct.deleteMany({ order_id: order._id });
  
  // Delete order - use deleteOne() as remove() is deprecated
  await Order.deleteOne({ _id: order._id });

  res.json({ message: 'Order removed' });
});

/**
 * @desc    Search orders by order_no with sorting
 * @route   GET /api/orders/search
 * @access  Public
 */
const searchOrders = asyncHandler(async (req, res) => {
  const { order_no, sort, dir } = req.query;
  
  if (!order_no) {
    res.status(400);
    throw new Error('Please provide an order number to search for');
  }

  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  // Configure sorting
  let sortOption = { createdAt: -1 }; // Default sort
  if (sort && dir) {
    sortOption = { [sort]: dir === 'asc' ? 1 : -1 };
  }

  const count = await Order.countDocuments({ 
    order_no: { $regex: order_no, $options: 'i' }
  });
  
  const orders = await Order.find({ 
    order_no: { $regex: order_no, $options: 'i' }
  })
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

/**
 * @desc    Filter orders by date range with sorting
 * @route   GET /api/orders/filter
 * @access  Public
 */
const filterOrdersByDate = asyncHandler(async (req, res) => {
  const { start_date, end_date, sort, dir } = req.query;
  
  if (!start_date || !end_date) {
    res.status(400);
    throw new Error('Please provide both start date and end date');
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  
  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999);

  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  // Configure sorting
  let sortOption = { createdAt: -1 }; // Default sort
  if (sort && dir) {
    sortOption = { [sort]: dir === 'asc' ? 1 : -1 };
  }

  const count = await Order.countDocuments({ 
    order_date: { $gte: startDate, $lte: endDate }
  });
  
  const orders = await Order.find({ 
    order_date: { $gte: startDate, $lte: endDate }
  })
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

/**
 * @desc    Export orders to Excel with filtering, searching, and sorting
 * @route   GET /api/orders/export/excel
 * @access  Public
 */
const exportOrdersToExcel = asyncHandler(async (req, res) => {
  const { start_date, end_date, order_no, sort, dir } = req.query;
  
  let query = {};
  
  // Apply date filter if provided
  if (start_date && end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999);
    
    query.order_date = { $gte: startDate, $lte: endDate };
  }

  // Apply search filter if provided
  if (order_no) {
    query.order_no = { $regex: order_no, $options: 'i' };
  }
  
  // Configure sorting
  let sortOption = { createdAt: -1 }; // Default sort
  if (sort && dir) {
    sortOption = { [sort]: dir === 'asc' ? 1 : -1 };
  }
  
  // Create a new Excel workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');
  
  // Add title with filter information
  let titleRow = worksheet.addRow(['Orders Export']);
  titleRow.font = { bold: true, size: 16 };
  worksheet.addRow([]);
  
  // Add filter information if any filters are applied
  if (start_date && end_date) {
    worksheet.addRow([`Date Range: ${new Date(start_date).toLocaleDateString()} to ${new Date(end_date).toLocaleDateString()}`]);
  }
  if (order_no) {
    worksheet.addRow([`Search: Order number containing "${order_no}"`]);
  }
  if (sort && dir) {
    worksheet.addRow([`Sorted by: ${sort} (${dir === 'asc' ? 'ascending' : 'descending'})`]);
  }
  worksheet.addRow([]);
  
  // Define columns
  worksheet.columns = [
    { header: 'Order No', key: 'order_no', width: 20 },
    { header: 'Customer Name', key: 'customer_name', width: 25 },
    { header: 'Order Date', key: 'order_date', width: 20 },
    { header: 'Grand Total', key: 'grand_total', width: 15 }
  ];
  
  // Style header row (the actual data headers, not the title)
  const headerRow = worksheet.lastRow;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Get orders (with cursor for large datasets) and apply sorting
  const ordersCursor = Order.find(query).sort(sortOption).cursor();
  
  // Process orders in batches to handle large datasets efficiently
  let rowCount = headerRow.number;
  let order = await ordersCursor.next();
  
  while (order) {
    rowCount++;
    
    // Add order data to worksheet
    const dataRow = worksheet.addRow({
      order_no: order.order_no,
      customer_name: order.customer_name,
      order_date: order.order_date.toLocaleDateString(),
      grand_total: order.grand_total.toFixed(2)
    });
    
    // Format date and number cells
    worksheet.getCell(`C${rowCount}`).numFmt = 'dd/mm/yyyy';
    worksheet.getCell(`D${rowCount}`).numFmt = '#,##0.00';
    
    // Alternate row colors for better readability
    if (rowCount % 2 === 0) {
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFAFAFA' }
        };
      });
    }
    
    // Get next order
    order = await ordersCursor.next();
  }
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
  
  // Write to response
  await workbook.xlsx.write(res);
  
  // End response
  res.end();
});

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  searchOrders,
  filterOrdersByDate,
  exportOrdersToExcel
};
