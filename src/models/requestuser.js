'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RequestUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RequestUser.init({
    email : {
      type : DataTypes.STRING, 
      allowNull : false,
    },
    user_id : {
      type : DataTypes.INTEGER,
      allowNull : false,
    },
    title : {
      type : DataTypes.STRING,
      allowNull : false,
    },
    description : {
      type : DataTypes.STRING,
    },
    is_uploaded : {
      type : DataTypes.BOOLEAN,
      allowNull : false,
    },
    deadline : {
      type : DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'RequestUser',
  });
  return RequestUser;
};