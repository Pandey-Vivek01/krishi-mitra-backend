const Order = require("../models/Order");
const Product = require("../models/Product");

// Place Order (Buyer only)
exports.placeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const buyerId = req.user.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.status === "sold_out") {
      return res.status(400).json({ success: false, message: "Product is sold out" });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} ${product.unit} available`,
      });
    }

    const totalAmount = quantity * product.pricePerUnit;

    const order = await Order.create({
      buyer: buyerId,
      farmer: product.farmer,
      product: productId,
      quantity,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// Get Buyer's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("product", "cropName pricePerUnit unit images")
      .populate("farmer", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get Farmer's incoming orders
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate("product", "cropName pricePerUnit unit images")
      .populate("buyer", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Update Order Status (Farmer only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const allowedTransitions = {
      pending: ["confirmed", "rejected"],
      confirmed: ["ready_to_ship"],
      ready_to_ship: [],
      paid: ["delivered"],
      delivered: [],
      rejected: [],
    };

    if (!allowedTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("product", "cropName pricePerUnit unit images")
      .populate("farmer", "firstName lastName email")
      .populate("buyer", "firstName lastName email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only buyer or farmer of this order can view
    if (
      order.buyer._id.toString() !== req.user.id &&
      order.farmer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};