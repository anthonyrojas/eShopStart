'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', {
    shipmentId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Shipment ID cannot be empty.'
        },
        notEmpty: {
          msg: 'Shipment ID cannot be empty.'
        }
      }
    },
    rateId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Rate ID cannot be empty.'
        },
        notEmpty: {
          msg: 'Rate ID cannot be empty.'
        }
      }
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {});
  Shipment.associates = function(models){
    Shipment.belongsTo(models.Order, {
      foreignKey: 'orderId'
    })
  }
  return Shipment;
};