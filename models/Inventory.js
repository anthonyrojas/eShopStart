'use strict';
module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define('Inventory', {
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product inventory cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product inventory cannot be empty.'
                }
            }
        }
    }, {});
    Inventory.associate = function(models){
        Inventory.belongsTo(models.Product, {
            foreignKey: 'productId'
        });
    }
    return Inventory;
}