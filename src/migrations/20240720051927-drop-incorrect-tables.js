'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserLocations');
    await queryInterface.dropTable('Locations');
  },

  down: async (queryInterface, Sequelize) => {
    // Không cần thiết phải viết hàm down, vì bạn sẽ tạo lại các bảng ở migration khác
  }
};
