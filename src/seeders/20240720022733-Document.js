'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = [
      {
        name: 'hcmus-logo.png',
        CID: 'QmZZx2bzU1QpeqjYw4w3pNqZrcgmo6fe1zJJ8CQmC63BLE',
        user_id: 1,
        file_format: 'image/png',
        file_size: 264847,
        has_password: false,
        password_hash: null,
        is_public: false,
        created_date: Sequelize.literal('NOW()'),
      },
      {
        name: 'Log in.png',
        CID: 'QmUpW3vLBivZF2ykCuodHYC1tUZAjN3p4ic5ofxbe76oHP',
        user_id: 1,
        file_format: 'image/png',
        file_size: 552550,
        has_password: true,
        password_hash: 'abcdefssdsfsddcssd',
        is_public: true,
        created_date: Sequelize.literal('NOW()'),
      },
      {
        name: 'Thu Chi Camping 21CNTN.png',
        CID: 'QmQs64B4xoscfJx5YELg2X1SVie99uve7tNE5f449XiS6W',
        user_id: 1,
        file_format: 'image/png',
        file_size: 126320,
        has_password: true,
        password_hash: 'abcdefssdsfsddcssd',
        is_public: true,
        created_date: Sequelize.literal('NOW()'),
      },
      {
        name: 'workflow-tkpm.png',
        CID: 'QmUgzhFp2Fgnst6LieSqiw9eHeaAJmLfYB6NBUi3T5J469',
        user_id: 1,
        file_format: 'image/png',
        file_size: 155679,
        has_password: false,
        password_hash: null,
        is_public: false,
        created_date: Sequelize.literal('NOW()'),
      }
    ];
    data.forEach(item => {
      item.createdAt = Sequelize.literal('NOW()');
      item.updatedAt = Sequelize.literal('NOW()');
    });
    await queryInterface.bulkInsert('Documents', data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Documents', null, {});
  }
};
