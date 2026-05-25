const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'test',                          // 🔥 UPDATED: Back to the verified 'test' database layout
  '31ywwu39RmuPMuA.root',          // Your active DB User
  'fxTDL3Y8nO8U26A1',              // Your working updated password
  {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 
    dialect: 'mysql',
    port: 4000, 
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true   // Enforces secure TLS routing
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };