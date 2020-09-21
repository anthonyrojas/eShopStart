'use strict';

const OrderProduct = require("./OrderProduct");

module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        total: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'The total amount for this order must be specified.'
                },
                notEmpty: {
                    msg: 'The total amount for this order must be specified.'
                }
            }
        },
        stripePaymentId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            // validate: {
            //     notNull: {
            //         msg: 'Order must be associated with a stripe payment intent.'
            //     },
            //     notEmpty: {
            //         msg: 'Order must be associated with a stripe payment intent.'
            //     }
            // }
        },
        paymentStatus: {
            type: DataTypes.ENUM('Initiated', 'Completed'),
            allowNull: false,
            default: 'Initiated',
            validate: {
                notNull: {
                    msg: 'Order payment status cannot be empty.'
                },
                notEmpty: {
                    msg: 'Order payment status cannot be empty.'
                }
            }
        }
    }, {});
    Order.associate = function(models) {
        Order.belongsTo(models.User, {
            foreignKey: 'userId'
        })
        Order.belongsToMany(models.Product,{
            through: 'OrderProduct',
            foreignKey: 'orderId'
        });
        // Order.hasMany(models.Product, {
        // })
    }
    return Order;
}