'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Devices', {
      fields: ['device'],
      type: 'unique',
      name: 'unique_device_constraint' // Tên của ràng buộc
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Devices', 'unique_device_constraint');
  }
};
