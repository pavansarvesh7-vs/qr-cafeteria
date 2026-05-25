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
// 🛡️ Permissive CORS rule to handle the frontend cross-domain preflight handshakes
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
// 4. API ROUTES
// ==========================================
// 🔐 LINK THE AUTH ROUTES MATRIX (Make sure authRoutes.js exists in your routes folder!)
app.use('/api/auth', require('./routes/authRoutes'));

// app.use('/api/menu', require('./routes/menuRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('✅ DATABASE_CONNECTION_ESTABLISHED');
    
    // Sync models with schema alterations allowed
    await sequelize.sync({ alter: true }); 
    console.log('📦 DATABASE_MODELS_SYNCED_AND_UPDATED');
    
    // Production deployment structural overrides for Render
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