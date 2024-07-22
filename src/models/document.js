'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Document.init({
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
    has_password :{
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
    },
    iv:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_public:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Document',
  });
  return Document;
};
