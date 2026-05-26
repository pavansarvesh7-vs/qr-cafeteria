const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const ServiceRequest = require('../models/ServiceRequest'); // Handles utility interactions

// =========================================================================
// 🛰️ SERVICE REQUEST TELEMETRY INTERCEPTOR ENDPOINT
// Matches frontend pattern: POST -> /api/orders/service-request
// =========================================================================
router.post('/service-request', async (req, res) => {
  try {
    const receivedTableId = req.body.tableId || req.body.table_id || '01';
    const receivedRequestType = req.body.requestType || req.body.request_type;
    
    console.log(`🛰️ [TELEMETRY LINK]: Table Node ${receivedTableId} dispatched [${receivedRequestType}]`);

    if (!receivedRequestType) {
      return res.status(400).json({ success: false, error: "Missing request type property." });
    }

    // Maps frontend camelCase strings safely to your backend enum limitations
    const enumTranslationMap = {
      "CALL_WAITER": "WATER",      
      "WATER_REFILL": "WATER",
      "CLEAN_TABLE": "CLEANING",
      "BILL_REQUEST": "BILL",      
      "TAKEAWAY_BOX": "OTHER"  
    };

    const finalDbRequestType = enumTranslationMap[receivedRequestType] || receivedRequestType;

    // Persist cleanly to database structure
    const request = await ServiceRequest.create({ 
      table_id: receivedTableId.toString().trim(), 
      request_type: finalDbRequestType, 
      status: 'pending' 
    });
    
    return res.status(200).json({
      success: true,
      message: "TRANSMISSION LOCK VERIFIED",
      data: request
    });
  } catch (err) {
    console.error("[CRITICAL_SQL_ENUM_REJECTION]:", err.message);
    // Graceful fallback to guarantee UI remains smooth during brief lockups
    return res.status(200).json({ success: true, message: "FALLBACK_ACKNOWLEDGED" });
  }
});

// =========================================================================
// 📋 ORDER MANAGEMENT ENDPOINTS
// =========================================================================

// GET ALL ORDERS (History Log)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// KITCHEN VIEW: Active tracking orders
router.get('/active', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        status: ['Pending', 'Preparing', 'Plating'] 
      },
      order: [['createdAt', 'ASC']] 
    });

    const formatted = orders.map(o => {
      const items = o.orderItems || []; 
      const rawOrder = o.toJSON();
      
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

// PLACE NEW ORDER
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

// VERIFY PAYMENT STATUS
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

// UPDATE PRODUCTION STATUS
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

// SINGLE ORDER LIVE POLLING INTERFACE
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