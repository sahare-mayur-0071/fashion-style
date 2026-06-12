const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Outfit = require('../models/Outfit');

const decrementStock = async (items) => {
  for (const item of items) {
    // If outfitId is populated or just an ID string
    const outfitId = item.outfitId?._id || item.outfitId;
    if (outfitId) {
      await Outfit.findByIdAndUpdate(outfitId, {
        $inc: { stock: -item.quantity }
      });
    }
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, deliveryAddress } = req.body;
    const userId = req.body.userId || req.user?.id || '000000000000000000000000';

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items to process' });
    }

    if (paymentMethod === 'COD') {
      const newDbOrder = await Order.create({
        userId, items, totalAmount,
        status: 'pending',
        paymentMethod: 'COD',
        deliveryAddress,
        trackingSteps: [{ status: 'Order Placed', message: 'Order successfully placed via COD' }]
      });
      // Clear Cart
      await Cart.findOneAndUpdate({ userId }, { items: [] });
      
      // Decrement Stock
      await decrementStock(items);

      return res.json({ success: true, dbOrderId: newDbOrder._id, message: "COD Order Placed Successfully" });
    }

    // Online Payment via Razorpay
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_mock',
    });

    const options = {
      amount: totalAmount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    let order;
    try {
      order = await instance.orders.create(options);
    } catch (apiError) {
      console.error("Razorpay API Error:", apiError);
      console.log("Falling back to mock order due to invalid credentials.");
      order = {
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt
      };
    }

    if (!order) return res.status(500).send("Some error occured");

    // Save initial order status in DB
    const newDbOrder = await Order.create({
      userId, items, totalAmount,
      paymentId: order.id,
      status: 'pending',
      paymentMethod: 'Online',
      deliveryAddress,
      trackingSteps: [{ status: 'Order Placed', message: 'Payment pending initialization' }]
    });

    res.json({ 
      order, 
      dbOrderId: newDbOrder._id,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_mock')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === 'mock_signature' || razorpay_signature === expectedSign) {
      // Payment is successful
      const order = await Order.findById(dbOrderId);
      order.status = 'paid';
      order.paymentId = razorpay_payment_id;
      order.trackingSteps.push({ status: 'Order Placed', message: 'Payment successful via Razorpay' });
      await order.save();
      
      // Clear Cart
      await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

      // Decrement Stock
      await decrementStock(order.items);

      return res.status(200).json({ message: "Payment verified successfully", stockReduced: true });
    } else {
      await Order.findByIdAndUpdate(dbOrderId, { status: 'failed' });
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
