'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
  }, {});
  Cart.associate = function(models){
    Cart.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    Cart.hasMany(models.CartItem)
  }
  return Cart;
}