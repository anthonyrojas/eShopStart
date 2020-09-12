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
    }
  }, {});
  Shipment.associates = function(models){
    Shipment.belongsTo(models.Order, {
      foreignKey: 'orderId'
    })
  }
  return Shipment;
};