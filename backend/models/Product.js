const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  price: { 
    type: DataTypes.DECIMAL(10, 2), // Changed from FLOAT to DECIMAL for precise financial currency handling
    allowNull: false 
  },
  category: { 
    type: DataTypes.STRING 
  },
  description: { 
    type: DataTypes.TEXT 
  },
  image: { 
    type: DataTypes.STRING 
  },
  isAvailable: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'products', // Guarantees matching to your exact TiDB table name
  timestamps: true       // Enforces clean tracking fields (createdAt, updatedAt)
});

module.exports = Product;