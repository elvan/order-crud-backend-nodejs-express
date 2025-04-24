const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate subtotal
orderProductSchema.pre('save', function (next) {
  this.subtotal = this.qty * this.price;
  next();
});

const OrderProduct = mongoose.model('OrderProduct', orderProductSchema);

module.exports = OrderProduct;
