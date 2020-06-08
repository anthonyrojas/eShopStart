'use strict';

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
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Order must be associated with a stripe payment intent.'
                },
                notEmpty: {
                    msg: 'Order must be associated with a stripe payment intent.'
                }
            }
        }
    }, {});
    Order.associate = function(models) {
        Order.belongsTo(models.User, {
        })
        Order.belongsToMany(models.Product,{
            through: 'OrderProduct'
        })
        // Order.hasMany(models.Product, {
        // })
    }
    return Order;
}