'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      isDeliverable: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      isDigital: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      digitalPath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      weight: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true
      },
      height: {
        type: Sequelize.DECIMAL(10,1),
        allowNull: true
      },
      width: {
        type: Sequelize.DECIMAL(10,1),
        allowNull: true
      },
      length: {
        type: Sequelize.DECIMAL(10,1),
        allowNull: true
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      upc: {
        type: Sequelize.BIGINT(12),
        allowNull: true
      },
      isbn: {
        type: Sequelize.BIGINT(13),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Products');
  }
};
