'use strict';
module.exports = (sequelize, DataTypes) => {
    const ProductImage = sequelize.define('ProductImage', {
        url: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product image cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product image cannot be empty.'
                }
            }
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Product image order cannot be empty.'
                },
                notEmpty: {
                    msg: 'Product image order cannot be empty.'
                }
            }
        },
        isLocal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Must specify if the image is being uploaded to the server or to AWS S3.'
                },
                notEmpty: {
                    msg: 'Must specify if the image is being uploaded to the serevr or to AWS S3.'
                }
            }
        }
    }, {});
    ProductImage.associate = function(models){
        ProductImage.belongsTo(models.Product, {
            foreignKey: 'productId'
        })
    }
    return ProductImage;
}