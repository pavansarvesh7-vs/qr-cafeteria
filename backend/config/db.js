const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 4000, // Default TiDB Cloud port
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true // Ensures a secure connection to TiDB Cloud
      }
    },
    logging: false // Keeps Render logs clean
  }
);

module.exports = { sequelize };