'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDevice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserDevice.belongsTo(models.User, {foreignKey: 'userID'});
      UserDevice.belongsTo(models.Device, {foreignKey: 'deviceID'});
    }
  }
  UserDevice.init({
    userID: DataTypes.INTEGER,
    deviceID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserDevice',
  });
  return UserDevice;
};