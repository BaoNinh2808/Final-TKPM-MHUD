const cron = require('node-cron');
const { Verification } = require('../models');
const { Op } = require('sequelize');

const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() - 60 * 1000); // 60 seconds ago

    await Verification.destroy({
      where: {
        createdAt: {
          [Op.lte]: expiryDate
        }
      }
    });
  });
};

module.exports = startCronJobs;
