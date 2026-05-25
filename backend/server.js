const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./config/db'); 

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Base Health probe
app.get('/', (req, res) => {
  res.status(200).json({ status: "success", message: "Vault Kitchen Live Engine Running." });
});

// Modular Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/service', require('./routes/serviceRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DATABASE_CONNECTION_ESTABLISHED');
    
    // Auto-generates tables securely within your read/write 'test' schema space
    await sequelize.sync({ alter: true });
    console.log('📦 DATABASE_MODELS_SYNCHRONIZED');
    
    const PORT = process.env.PORT || 5000; 
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 PRODUCTION SERVER ACTIVE ON PORT: ${PORT}`);
    });
  } catch (err) {
    console.error('❌ CRITICAL_STARTUP_FAILURE:', err.message);
    process.exit(1);
  }
};

startServer();