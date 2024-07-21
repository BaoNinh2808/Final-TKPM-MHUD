'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserLocation.belongsTo(models.User, {foreignKey: 'userID'});
      UserLocation.belongsTo(models.Location, {foreignKey: 'locationID'});
    }
  }
  UserLocation.init({
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    locationID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserLocation',
  });
  return UserLocation;
};