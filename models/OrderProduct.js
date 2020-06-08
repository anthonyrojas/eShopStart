'use strict';

module.exports = (sequelize, DataTypes) => {
    const OrderProduct = sequelize.define('OrderProduct', {
        orderStatus: {
            type: DataTypes.ENUM('Processing', 'Fulfilling', 'Delivered'),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Order item status must be specified.'
                },
                notEmpty: {
                    msg: 'Order item status must be specified.'
                }
            }
        }
    }, {});
    OrderProduct.associate = function(models){
    }
    return OrderProduct;
}