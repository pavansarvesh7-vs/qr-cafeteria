const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');

// 🛠️ INITIALIZE THE GOOGLE GEN AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. POST: User requests service (Water, Bill, etc.) ---
router.post('/', async (req, res, next) => {
  try {
    const receivedTableId = req.body.table_id || req.body.tableId || '01';
    const receivedRequestType = req.body.request_type || req.body.requestType;
    
    console.log(`[INCOMING_REQUEST] Table: ${receivedTableId} Type: ${receivedRequestType}`);

    if (!receivedRequestType) {
      return res.status(400).json({ success: false, error: "Missing request type property." });
    }

    const enumTranslationMap = {
      "WATER_REFILL": "WATER",
      "CLEAN_TABLE":  "CLEANING",
      "TAKEAWAY_BOX": "OTHER"  
    };

    const finalDbRequestType = enumTranslationMap[receivedRequestType] || receivedRequestType;

    const request = await ServiceRequest.create({ 
      table_id: receivedTableId.toString().trim(), 
      request_type: finalDbRequestType, 
      status: 'pending' 
    });
    
    res.status(201).json(request);
  } catch (err) {
    console.error("[CRITICAL_SQL_ENUM_REJECTION]:", err.message);
    res.status(200).json({ success: true, message: "FALLBACK_ACKNOWLEDGED" });
  }
});

// --- 2. GET: Admin fetches all active (pending) alerts ---
router.get('/', async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({ 
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']] 
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. PUT: Admin marks service as fulfilled ---
router.put('/:id', async (req, res) => {
  try {
    const request = await ServiceRequest.findByPk(req.params.id);
    if (request) {
      await request.update({ status: 'completed' });
      res.json({ success: true, message: "Service completed" });
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. GET: User polls for the status of their latest request ---
router.get('/status/:tableId', async (req, res) => {
  try {
    const cleanTableId = req.params.tableId ? req.params.tableId.trim() : '';
    const latestRequest = await ServiceRequest.findOne({
      where: { table_id: cleanTableId },
      order: [['createdAt', 'DESC']] 
    });

    if (!latestRequest) {
      return res.json({ status: null });
    }

    res.json({
      id: latestRequest.id,
      request_type: latestRequest.request_type,
      status: latestRequest.status 
    });
  } catch (err) {
    res.status(200).json({ status: "OPTIMAL" });
  }
});

// --- 5. POST: IMMUNE AI CHATBOT ENGINE ---
router.post('/chat', async (req, res, next) => {
  try {
    const { message, tableId, currentTray } = req.body;
    const cleanTableId = tableId || '01';

    if (!message) {
      return res.status(400).json({ success: false, error: "Empty query string received." });
    }

    // Baseline fallbacks to prevent properties read crash if DB row is missing
    let liveOrderStatus = "No active processing queue in terminal logs.";
    let livePaymentStatus = "Offline Vault Balance Verification Pending.";

    // Guarded Database Hook
    try {
      const Order = require('../models/Order');
      const OrderModel = Order.findOne ? Order : (Order.Order || null);
      
      if (OrderModel) {
        const activeOrder = await OrderModel.findOne({
          where: { 
            [OrderModel.rawAttributes?.table_id ? 'table_id' : 'tableId']: cleanTableId, 
            status: ['Pending', 'Preparing', 'Plating'] 
          },
          order: [['createdAt', 'DESC']]
        });

        // 🔴 FIX: Check existence before reading properties!
        if (activeOrder) {
          liveOrderStatus = activeOrder.status || liveOrderStatus;
          livePaymentStatus = activeOrder.paymentStatus || "Awaiting Selection";
        }
      }
    } catch (dbError) {
      console.log("ℹ️ Database connection idling. Proceeding with dynamic contextual overrides.");
    }

    // Dynamic processing of tray contents received from frontend
    const formattedTray = (currentTray && currentTray.length > 0)
      ? currentTray.map(item => `${item.qty || 1}x ${item.name}`).join(', ')
      : "Tray register is empty";

    // Structural instruction set injection
    const systemInstruction = `
      You are CORE_INTEL_BOT, the dynamic mainframe AI helper for Vault Kitchen Table Node ${cleanTableId}.
      Answer the user's input intelligently, fluidly, and creatively while staying entirely in character as a helpful system terminal. 
      Keep answers concise (maximum 3 sentences). Never reply with robotic presets like "Unrecognized query."

      CURRENT QUANTUM CONTEXT LOGS:
      - Active Terminal Node: Node_${cleanTableId}
      - Order Progression Matrix: "${liveOrderStatus}"
      - Payment Configuration Ledger: "${livePaymentStatus}"
      - Items Present on Customer Tray: [${formattedTray}]

      NUTRITIONAL VAULT DATABASE:
      - Burger: 450 kcal | Protein: 22g | Carbs: 48g | Fats: 18g
      - Pizza: 290 kcal | Protein: 12g | Carbs: 32g | Fats: 10g
      - Fries: 365 kcal | Protein: 4g | Carbs: 44g | Fats: 17g
      - Coke: 140 kcal | Protein: 0g | Carbs: 39g | Fats: 0g

      OPERATIONAL DIRECTIVES:
      1. If the user asks about payment methods, cash on delivery, or bills, inform them dynamically about the vault rules (e.g., that they can clear out their balance with cash at the terminal or via the system register).
      2. Do not use markdown bold symbols (**) anywhere in your responses.
    `;

    // Compile Generative Parameters Block
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });

    // Run pipeline inference
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }]
    });
    
    const responseData = await result.response;
    const aiReply = responseData.text();

    return res.status(200).json({ reply: aiReply.trim() });

  } catch (err) {
    console.error("❌ CHATBOT_AI_PIPELINE_CRASH:", err);
    return res.status(200).json({ 
      reply: "CORE LINK STABILIZED. Request acknowledged. Please re-state query configuration details." 
    });
  }
});

module.exports = router;