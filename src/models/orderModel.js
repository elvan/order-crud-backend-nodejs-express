const mongoose = require('mongoose');
const OrderProduct = require('./orderProductModel');

const orderSchema = new mongoose.Schema(
  {
    order_no: {
      type: String,
      required: true,
      unique: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    order_date: {
      type: Date,
      required: true,
    },
    grand_total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual for order products
orderSchema.virtual('products', {
  ref: 'OrderProduct',
  localField: '_id',
  foreignField: 'order_id',
});

// Pre-deleteOne hook to delete associated order products when an order is deleted
// Note: This uses newer Mongoose middleware pattern as 'remove' is deprecated
orderSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await OrderProduct.deleteMany({ order_id: this._id });
  next();
});

// Also add pre middleware for findOneAndDelete for compatibility
orderSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await OrderProduct.deleteMany({ order_id: doc._id });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
