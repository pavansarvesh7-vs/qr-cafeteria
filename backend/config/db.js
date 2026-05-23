const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sys',      // Defaults to 'sys' if env variable isn't loaded yet
  process.env.DB_USER,      
  process.env.DB_PASSWORD,  
  {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT || 4000, // TiDB Cloud requires port 4000 instead of standard 3306
    dialect: 'mysql',
    logging: false,                    // Prevents console clutter during queries
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false      // Crucial: allows Render environments to skip native CA cert checks
      }
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected Successfully');
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
  }
};

module.exports = { sequelize, connectDB };