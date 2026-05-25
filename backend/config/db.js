const { Sequelize } = require('sequelize');
require('dotenv').config();

// 🛠️ HARD-OVERRIDE CONNECTION SCHEME (Bypasses Render Environment Variable Cache Errors)
const sequelize = new Sequelize(
  'test',                          // DB Name: Enforces the read/write 'test' schema
  '31ywwu39RmuPMuA.root',          // DB User: From your TiDB panel screenshot
  'oQdE1X7Gix3OBKcr',              // DB Password: From your TiDB panel screenshot
  {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', // Explicit regional host
    dialect: 'mysql',
    port: 4000, 
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true   // Mandatory secure SSL flag for TiDB Cloud
      }
    },
    logging: false, // Prevents raw terminal log cluttering
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };