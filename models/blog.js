'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  };
  Blog.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    author: {
      allowNull: true,
      type: DataTypes.STRING
    },
    title: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    body: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    image: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    publish: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'Blog',
    timestamps: true,
    paranoid: true,
    tableName: 'blogs',
  });
  // Blog.sync({force: true})
  return Blog;
};