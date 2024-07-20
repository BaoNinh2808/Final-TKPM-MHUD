'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('IPAddresses', {
      fields: ['ipAddress'],
      type: 'unique',
      name: 'unique_ipAddress_constraint' // Tên của ràng buộc
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('IPAddresses', 'unique_ipAddress_constraint');
  }
};
