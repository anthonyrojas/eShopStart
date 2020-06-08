'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: {
                args: true,
                msg: 'Email is already in use.'
            },
            validate: {
                notNull: {
                    msg: 'Email must be provided'
                },
                notEmpty: {
                    msg: 'Email must be provided'
                },
                isEmail: {
                    msg: 'Email must be a valid format.'
                }
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Password must be provided.'
                },
                notEmpty: {
                    msg: 'Password must be provided.'
                }
            }
        },
        firstName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'First name must be provided.'
                },
                notEmpty: {
                    msg: 'First name must be provided.'
                },
                isAlpha: {
                    msg: 'First name must consist of only letters.'
                }
            }
        },
        lastName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull:{
                    msg: 'Last name must be provided.'
                },
                notEmpty: {
                    msg: 'Last name must be provided.'
                },
                isAlpha: 'First name must consist of only letters.'
            }
        },
        middleInitial: {
            type: DataTypes.STRING(2),
            allowNull: true
        },
        birthdate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Birth date must be provided.'
                },
                notEmpty: {
                    msg: 'Birth date must be provided.'
                }
            }
        },
        role: {
            type: DataTypes.ENUM('SuperAdmin', 'Admin', 'Customer'),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'User role cannot be empty.'
                },
                notEmpty: {
                    msg: 'User role cannot be empty.'
                }
            }
        }
    }, {});
    User.associate = function(models){
    }
    return User;
}