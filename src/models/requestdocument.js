'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RequestDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RequestDocument.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }, 
    CID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_format: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_public:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    uploader_email:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'RequestDocument',
  });
  return RequestDocument;
};