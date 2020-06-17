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
      weight: {
        type: Sequelize.DECIMAL(10,2),
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
