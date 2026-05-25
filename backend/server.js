// ==========================================
// 1. DEPENDENCIES & CONFIGURATION
// ==========================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import the verified sequelize instance
const { sequelize } = require('./config/db'); 

const app = express();

// ==========================================
// 2. MIDDLEWARE CONFIGURATION
// ==========================================
// 🛡️ Permissive CORS rule to handle frontend cross-domain preflight handshakes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. HEALTH CHECK & BASE ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Vault Kitchen API is online and fully operational."
  });
});

// ==========================================
// 4. API ROUTES (Explicit Naming Configuration)
// ==========================================
// 🔐 AUTHENTICATION MATRIX
app.use('/api/auth', require('./routes/authRoutes'));

// 🍔 MENU MANAGEMENT PIPELINE
// Maps to: routes/menu.js
app.use('/api/menu', require('./routes/menu'));

// 🛒 CUSTOMER ORDER INTAKE ENGINE
// Maps to: routes/orderRoutes.js
app.use('/api/orders', require('./routes/orderRoutes'));

// 🚨 LIVE TABLE ASSISTANCE QUEUE
// Maps to: routes/serviceRoutes.js
app.use('/api/service', require('./routes/serviceRoutes'));

// 📦 PRODUCT METADATA ROUTER (Matches extra project controller file)
// Maps to: routes/productRoutes.js
app.use('/api/products', require('./routes/productRoutes'));

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
const startServer = async () => {
  try {
    // Authenticate database connectivity parameters
    await sequelize.authenticate();
    console.log('✅ DATABASE_CONNECTION_ESTABLISHED');
    
    // 🛡️ SAFE TIDB ALIGNMENT PATCH
    // Using standard sync() instead of { alter: true } to prevent UNIQUE constraint crashes on TiDB Cloud
    await sequelize.sync(); 
    console.log('📦 DATABASE_MODELS_SYNCED_AND_UPDATED');
    
    // Production deployment structural network overrides for Render hosting
    const PORT = process.env.PORT || 5000; 
    const HOST = '0.0.0.0'; 

    app.listen(PORT, HOST, () => {
      console.log('===========================================');
      console.log(`🛡️  VAULT KITCHEN SYSTEM v2.1`);
      console.log(`🚀 PRODUCTION SERVER ACTIVE ON PORT: ${PORT}`);
      console.log('===========================================');
    });
  } catch (err) {
    console.error('❌ CRITICAL_STARTUP_FAILURE:', err.message);
    process.exit(1);
  }
};

startServer();