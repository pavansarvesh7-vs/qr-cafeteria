// 5. SERVER INITIALIZATION
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DATABASE_CONNECTION_ESTABLISHED');
    
    await sequelize.sync({ alter: true }); 
    console.log('📦 DATABASE_MODELS_SYNCED_AND_UPDATED');
    
    // --- UPDATED FOR PRODUCTION DEPLOYMENT ---
    const PORT = process.env.PORT || 5000; // Allows Render to inject its own port
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