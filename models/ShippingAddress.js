'use strict';
// const {
//   Model
// } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ShippingAddress = sequelize.define('ShippingAddress', {
    street: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Address street must be provided.'
        },
        notEmpty: {
          msg: 'Address street must be provided.'
        }
      }
    },
    apt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Address city must be provided.'
        },
        notEmpty: {
          msg: 'Address city must be provided.'
        }
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Address state must be provided.'
        },
        notEmpty: {
          msg: 'Address state must be provided.'
        }
      }
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Address zipcode must be provided.'
        },
        notEmpty: {
          msg: 'Address zipcode must be provided.'
        }
      }
    }
  }, {});
  ShippingAddress.associate = function(models){
    ShippingAddress.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  }
  return ShippingAddress;
}
