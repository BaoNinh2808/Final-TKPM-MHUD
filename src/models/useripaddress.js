'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserIPAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserIPAddress.belongsTo(models.User, {foreignKey: 'userID'});
      UserIPAddress.belongsTo(models.IPAddress, {foreignKey: 'ipAddressID'});
    }
  }
  UserIPAddress.init({
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ipAddressID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'UserIPAddress',
  });
  return UserIPAddress;
};