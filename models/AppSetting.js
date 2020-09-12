'use strict';
module.exports = (sequelize, DataTypes) => {
  const AppSetting = sequelize.define('AppSetting', {
    category: {
      type: DataTypes.ENUM('from_address', 'business', 'logo'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'The category of the app setting cannot be empty.'
        },
        notEmpty: {
          msg: 'The category of the app setting cannot be empty.'
        }
      }
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'The content of the app setting cannot be empty.'
        },
        notEmpty: {
          msg: 'The content of the app setting cannot be empty.'
        }
      }
    }
  })
  AppSetting.associate = function(models){
  }
  return AppSetting;
};