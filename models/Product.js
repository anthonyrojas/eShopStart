'use strict';

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: {
                args: true,
                msg: 'Product name is already in use.'
            },
            validate: {
                notNull: {
                    msg: 'The name of the product cannot be empty.'
                },
                notEmpty: {
                    msg: 'The name of the product cannot be empty.'
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'The product description cannot be empty.'
                },
                notEmpty: {
                    msg: 'The product description cannot be empty.'
                }
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product price cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product price cannot be empty.'
                }
            }
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product slug cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product slug cannot be empty.'
                }
            }
        },
        isDeliverable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product deliverable status cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product deliverable status cannot be empty.'
                }
            }
        },
        isDigital: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product digital status cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product digital status cannot be empty.'
                }
            }
        },
        digitalPath: {
            type: DataTypes.STRING,
            allowNull: true
        },
        length: {
            type: DataTypes.DECIMAL(10,1),
            allowNull: true
        },
        width: {
            type: DataTypes.DECIMAL(10,1),
            allowNull: false
        },
        height: {
            type: DataTypes.DECIMAL(10,1),
            allowNull: false
        },
        weight: {
            type: DataTypes.DECIMAL(10,2),//weight in ounces
            allowNull: true
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true
        },
        upc: {
            type: DataTypes.BIGINT(12),
            allowNull: true
        },
        isbn: {
            type: DataTypes.BIGINT(13),
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product active status cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product active status cannot be empty.'
                }
            }
        }
    }, {});
    Product.associate = function(models){
        Product.belongsToMany(models.Category, {
            through: 'ProductCategories'
        });
        Product.hasOne(models.Inventory, {
            onDelete: 'CASCADE'
        });
        Product.hasMany(models.ProductImage, {
            onDelete: 'CASCADE'
        });
        Product.belongsToMany(models.Order,{
            through: 'OrderProduct',
            foreignKey: 'productId'
        });
        Product.hasMany(models.CartItem);
    }
    return Product;
}