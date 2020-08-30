'use strict';
module.exports = (sequelize, DataTypes) => {
  const MailTemplate = sequelize.define('MailTemplate', {
    primaryTemplate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Must specify if this mail template is the primary template for this category.'
        },
        notEmpty: {
          msg: 'Must specify if this mail template is the primary template for this category.'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Mail template description cannot be empty.'
        },
        notEmpty: {
          msg: 'Mail template description cannot be empty.'
        }
      }
    },
    content: {
      type: DataTypes.TEXT('medium'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Mail template content cannot be empty.'
        },
        notEmpty: {
          msg: 'Mail template content cannot be empty.'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Mail template name cannot be empty.'
        },
        notEmpty: {
          msg: 'Mail template name cannot be empty.'
        }
      }
    },
    category: {
      type: DataTypes.ENUM('Orders', 'Account', 'Support'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Mail template category cannot be empty.'
        },
        notEmpty: {
          msg: 'Mail template category cannot be empty.'
        }
      }
    }
  });
  MailTemplate.associate = function(model){
  }
}