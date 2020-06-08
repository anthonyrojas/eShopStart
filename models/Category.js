'use strict';
module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Category name cannot be empty.'
                },
                notEmpty: {
                    msg: 'Category name cannot be empty.'
                }
            }
        }
    }, {});
    Category.associate = function(models){
        Category.belongsToMany(models.Product, {
            through: 'ProductCategory'
        });
    }
    return Category;
}