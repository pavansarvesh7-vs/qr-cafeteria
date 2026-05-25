const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'vault_kitchen',                 // DB Name: The newly created and authorized schema
  '31ywwu39RmuPMuA.root',          // DB User
  'oQdE1X7Gix3OBKcr',              // DB Password
  {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 
    dialect: 'mysql',
    port: 4000, 
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true   // Enforces the mandatory secure TLS socket layer
      }
    },
    logging: false,                // Keeps your Render runtime console logs clean
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };