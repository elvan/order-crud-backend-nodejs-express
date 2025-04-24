const Order = require('../models/orderModel');

/**
 * Generate a unique order number in the format: INV + YYYYMMDD + sequential number
 * @returns {Promise<string>} The generated order number
 */
const generateOrderNumber = async () => {
  // Get current date in format YYYYMMDD
  const today = new Date();
  const dateStr = today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, '0') +
    today.getDate().toString().padStart(2, '0');
  
  // Find the latest order from today to determine the next sequential number
  const latestOrder = await Order.findOne({
    order_no: { $regex: `^INV${dateStr}` }
  }).sort({ order_no: -1 });
  
  let nextSeq = 1;
  
  if (latestOrder) {
    // Extract the current sequence number from the latest order
    const currentSeq = parseInt(latestOrder.order_no.substring(11), 10);
    nextSeq = currentSeq + 1;
  }
  
  // Format the sequence number with leading zeros (3 digits)
  const seqStr = nextSeq.toString().padStart(3, '0');
  
  // Combine all parts into the order number
  return `INV${dateStr}${seqStr}`;
};

module.exports = { generateOrderNumber };
