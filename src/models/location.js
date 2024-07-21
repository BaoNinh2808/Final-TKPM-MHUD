'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Location.belongsToMany(models.User, {through: 'UserLocation', foreignKey: 'locationID', otherKey: 'userID'});
    }
  }
  Location.init({
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    long: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};