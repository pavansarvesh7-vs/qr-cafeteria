const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ServiceRequest = sequelize.define('ServiceRequest', {
    table_id: {
        type: DataTypes.STRING,
        allowNull: false,
        // Ensures the ID is trimmed to avoid "Table 01 " vs "Table 01" issues
        set(value) {
            this.setDataValue('table_id', value.trim());
        }
    },
    request_type: {
        type: DataTypes.ENUM('WATER', 'WAITER', 'BILL', 'CLEANING', 'OTHER'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed'),
        defaultValue: 'pending'
    },
    // We explicitly define this for the "Freshness Check" in UserHome (now - updatedTime < 60s)
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'service_requests',
    timestamps: true, // Crucial for the 60-second notification logic
    indexes: [
        // Indexing table_id speeds up the polling performance on the mobile side
        { fields: ['table_id'] },
        { fields: ['status'] }
    ]
});

module.exports = ServiceRequest;