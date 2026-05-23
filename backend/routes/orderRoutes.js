const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 1. GET ALL ORDERS (History Log)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 🍳 KITCHEN VIEW: FIXED TO INCLUDE INSTRUCTIONS TELEMETRY
router.get('/active', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        status: ['Pending', 'Preparing', 'Plating'] 
      },
      order: [['createdAt', 'ASC']] // Oldest orders prioritized first
    });

    const formatted = orders.map(o => {
      const items = o.orderItems || []; 
      const rawOrder = o.toJSON();
      
      // Append the global instruction note directly into the item name display string if it exists
      const noteSuffix = rawOrder.instructions && rawOrder.instructions.trim() !== "" 
        ? ` [NOTE: ${rawOrder.instructions.toUpperCase()}]` 
        : "";

      return {
        ...rawOrder,
        item_name: items.map(i => `${i.name} (x${i.qty || i.quantity || 1})`).join(", ") + noteSuffix,
        quantity: items.length
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PLACE ORDER
router.post('/', async (req, res) => {
  try {
    const { tableId, orderItems, totalAmount, paymentMethod, instructions } = req.body;
    const initialPaymentStatus = paymentMethod === 'CASH' ? 'Verified' : 'Pending';

    const newOrder = await Order.create({
      tableId,
      orderItems, 
      totalAmount,
      paymentMethod,
      instructions: instructions || '', 
      paymentStatus: initialPaymentStatus,
      status: 'Pending'
    });

    const items = newOrder.orderItems || [];
    const responsePayload = {
      ...newOrder.toJSON(),
      item_name: items.map(i => `${i.name} (x${i.qty || i.quantity || 1})`).join(", ")
    };
    
    res.status(201).json(responsePayload);
  } catch (err) {
    console.error("CRITICAL_DATABASE_FAULT:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. VERIFY PAYMENT
router.put('/:id/verify', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order manifest node not found" });
    
    await order.update({ paymentStatus: 'Verified', status: 'Preparing' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE STATUS
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order target unreachable" });
    
    await order.update({ status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. SINGLE ORDER STATUS
router.get('/status/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order node not found in sector records" });
    
    let items = order.orderItems || [];

    const trackingPayload = {
      ...order.toJSON(),
      item_name: items.map(i => `${i.name} (x${i.qty || i.quantity || 1})`).join(", ")
    };

    res.json(trackingPayload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;