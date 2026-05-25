const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Menu = sequelize.define("Menu", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Product name is required" }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: "Price cannot be negative" }
    }
  },
  category: {
    type: DataTypes.ENUM("Starter", "Main Course", "Dessert", "Beverage", "Sides"),
    allowNull: false,
    defaultValue: "Main Course"
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // --- VIRTUAL FIELD FOR IMAGE URL ---
  imageUrl: {
    type: DataTypes.VIRTUAL,
    get() {
      const imageFile = this.getDataValue('image');
      if (!imageFile) return null;

      const backendUrl = process.env.NODE_ENV === 'production' 
        ? "https://qr-cafeteria.onrender.com" 
        : "http://localhost:5000";

      return `${backendUrl}/uploads/${imageFile}`;
    }
  }
}, {
  tableName: "menus",
  timestamps: true,
});

module.exports = Menu;