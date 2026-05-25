const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'vault_kitchen',                 // DB Name: Your manually created database schema
  '31ywwu39RmuPMuA.root',          // DB User
  'fxTDL3Y8nO8U26A1',              // ⚡ FIXED: Your new active password from the TiDB panel
  {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 
    dialect: 'mysql',
    port: 4000, 
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true   // Mandated secure TLS verification layer
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