'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IPAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      IPAddress.belongsToMany(models.User, {
        through: 'UserIPAddress',
        foreignKey: 'ipAddressID',
        otherKey: 'userID'
      })
    }
  }
  IPAddress.init({
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'IPAddress',
  });
  return IPAddress;
};