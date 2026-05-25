// ==========================================
// 1. MODULE DEPENDENCIES & INITIALIZATION
// ==========================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./config/db'); 

const app = express();

// ==========================================
// 2. GLOBAL MIDDLEWARE MATRIX
// ==========================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static asset file structures securely (Uploaded culinary graphics)
app.use('/uploads', express.static('uploads'));

// ==========================================
// 3. SERVICE DIAGNOSTICS & HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Vault Kitchen Backend Engine running flawlessly on TiDB Cloud."
  });
});

// ==========================================
// 4. API ROUTING LAYER (Clean CommonJS Formats)
// ==========================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/service', require('./routes/serviceRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

// ==========================================
// 5. SECURE SERVER KICKSTART PIPELINE
// ==========================================
const startServer = async () => {
  try {
    // Test the physical TLS socket connection parameters
    await sequelize.authenticate();
    console.log('✅ DATABASE_CONNECTION_ESTABLISHED');
    
    // Bypasses destructive drops; structural changes auto-apply safely to the 'test' schema
    await sequelize.sync({ alter: true });
    console.log('📦 DATABASE_MODELS_SYNCHRONIZED (SCHEMA IS STABLE)');
    
    const PORT = process.env.PORT || 5000; 
    const HOST = '0.0.0.0'; 

    app.listen(PORT, HOST, () => {
      console.log('===========================================');
      console.log(`🛡️  VAULT KITCHEN RUNTIME INTERFACE ACTIVE`);
      console.log(`🚀 DEPLOYMENT LIVE ON NETWORK PATH: http://${HOST}:${PORT}`);
      console.log('===========================================');
    });
  } catch (err) {
    console.error('❌ SYSTEM_STARTUP_CRITICAL_FAILURE:');
    console.error(err);
    process.exit(1);
  }
};

startServer();