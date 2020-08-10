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
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Order product amount cannot be empty.'
                },
                notEmpty:{
                    msg: 'Order product amount cannot be empty.'
                }
            }
        }
    }, {});
    OrderProduct.associate = function(models){
    }
    return OrderProduct;
}