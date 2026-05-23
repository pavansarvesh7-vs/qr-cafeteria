const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  tableId: { 
    type: DataTypes.STRING, 
    allowNull: false,
    defaultValue: '01' 
  },
  totalAmount: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  orderItems: { 
    type: DataTypes.TEXT, 
    allowNull: false,
    set(value) {
      this.setDataValue('orderItems', JSON.stringify(value));
    },
    get() {
      const rawValue = this.getDataValue('orderItems');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (e) {
        return [];
      }
    }
  }, 
  // 📝 NEW: Storage segment for custom checkout notes/instructions
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  paymentMethod: { 
    type: DataTypes.STRING, 
    defaultValue: 'CASH'
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'Pending'
  }
});

module.exports = Order;