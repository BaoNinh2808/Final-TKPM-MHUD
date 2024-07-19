'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Devices', 'deivce', 'device');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Devices', 'device', 'deivce');
  }
};
