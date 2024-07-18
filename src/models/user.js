'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Device, { through: 'UserDevice', foreignKey: 'userID', otherKey: 'deviceID'});
      User.belongsToMany(models.IPAddress, {through: 'UserIPAddress', foreignKey: 'userID', otherKey: 'ipAddressID'});
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100] // Đảm bảo mật khẩu có độ dài từ 8 đến 100 ký tự
        }
    },
    name: {
        type: DataTypes.STRING,
    },
    phone_number: {
        type: DataTypes.STRING,
    },
    avatar_image: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};