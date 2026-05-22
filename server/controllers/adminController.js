const Order = require('../models/Order');
const Outfit = require('../models/Outfit');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenueData = await Order.aggregate([
      { $match: { status: { $ne: 'failed' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;
    const totalUsers = await User.countDocuments();
    const totalOutfits = await Outfit.countDocuments();

    res.json({
      totalOrders,
      totalRevenue,
      totalUsers,
      totalOutfits
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // Populate user details and outfit details (both legacy and new items array)
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('outfitId', 'title price image') // Legacy support
      .populate('items.outfitId', 'title price image') // New array support
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    
    // Add tracking step for the new status
    const trackingNamesMap = {
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    
    const trackingName = trackingNamesMap[status.toLowerCase()];
    if (trackingName) {
      // If going to shipped, also add Packed if not there
      if (status.toLowerCase() === 'shipped' && !order.trackingSteps.find(s => s.status === 'Packed')) {
        order.trackingSteps.push({
          status: 'Packed',
          message: 'Order has been packed and is ready to ship',
          timestamp: new Date()
        });
      }
      
      if (!order.trackingSteps.find(s => s.status === trackingName)) {
        order.trackingSteps.push({
          status: trackingName,
          message: `Order status updated to ${status.toUpperCase()}`,
          timestamp: new Date()
        });
      }
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating order status', error: error.message });
  }
};

exports.getStock = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { gender: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Outfit.countDocuments(query);
    const outfits = await Outfit.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      outfits,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stock', error: error.message });
  }
};

exports.addStock = async (req, res) => {
  try {
    const newOutfit = new Outfit(req.body);
    const savedOutfit = await newOutfit.save();
    res.status(201).json(savedOutfit);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding stock', error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const outfit = await Outfit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.json(outfit);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating stock', error: error.message });
  }
};

exports.deleteStock = async (req, res) => {
  try {
    const outfit = await Outfit.findByIdAndDelete(req.params.id);
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting stock', error: error.message });
  }
};
