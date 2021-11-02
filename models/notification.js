'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  Notification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    userId: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    type: {
      allowNull: true,
      type: DataTypes.ENUM("user", "admin")
    },
    message: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    status: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
  }, {
    sequelize,
    modelName: 'Notification',
    timestamps: true,
    paranoid: true,
    tableName: 'notifications',
  });
  return Notification;
};