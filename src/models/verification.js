'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Verification.init({
    userID: DataTypes.STRING,
    pin: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Verification',
    timestamps: true,
  });
  return Verification;
};
