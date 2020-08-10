'use strict';
module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Amount cannot be empty.'
        },
        notEmpty: {
          msg: 'Amount cannot be empty.'
        }
      }
    }
  }, {});
  CartItem.associate = function(models){
    CartItem.belongsTo(models.Cart, {
      foreignKey: 'cartId'
    });
    CartItem.belongsTo(models.Product, {
      onDelete: 'CASCADE',
      foreignKey: 'productId'
    });
  }
  return CartItem;
}