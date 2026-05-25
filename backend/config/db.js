const { Sequelize } = require('sequelize');
require('dotenv').config();

// Hard fallback to 'test' if Render configuration fails to pass the string dynamically
const dbName = process.env.DB_NAME && process.env.DB_NAME !== 'sys' ? process.env.DB_NAME : 'test';

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT) || 4000, 
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
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