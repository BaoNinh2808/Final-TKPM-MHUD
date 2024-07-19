'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Device.belongsToMany(models.User, { through: 'UserDevice', foreignKey: 'deviceID', otherKey: 'userID'});
    }
  }
  Device.init({
    device: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};