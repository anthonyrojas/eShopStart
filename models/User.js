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
                },
                min: {
                    args: [6],
                    msg: 'Password must be at least 6 characters.'
                },
                max: {
                    args: [20],
                    msg: 'Password cannot exceed 20 characters in length.'
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
                is: {
                    args: ["^[A-Za-z]+$",'i'],
                    msg: 'First name must consist of only letters.'
                }
                // isAlpha: {
                //     msg: 'First name must consist of only letters.'
                // }
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
                is: {
                    args: ["^[A-Za-z]+$",'i'],
                    msg: 'Last name must consist of only letters.'
                }
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