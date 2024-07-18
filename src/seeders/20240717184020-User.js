'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   let data = [
    {
      email: 'a@a.com',
      password: '123',
      name: 'a',
      phone_number: '123',
      avatar_image: 'a',
      role: 'user',
    },
    {
      email: 'huy@a.com',
      password: '123',
      name: 'huy',
      phone_number: '123',
      avatar_image: 'huy',
      role: 'user',
    }
  ];
  data.forEach(item => {
    item.createdAt = Sequelize.literal('NOW()');
    item.updatedAt = Sequelize.literal('NOW()');
  });
  await queryInterface.bulkInsert('Users', data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
