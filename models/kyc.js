'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");
module.exports = (sequelize, DataTypes) => {
  class Kyc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kyc.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  };
  Kyc.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    type: {
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue: 0,
    },
    image: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    status: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      get() {
        return dayjs(this.getDataValue('createdAt')).format('ddd, MMM D, YYYY, h:mm A');
      }
    }
  }, {
    sequelize,
    modelName: 'Kyc',
    timestamps: true,
    paranoid: true,
    tableName: 'Kycs',
  });
  return Kyc;
};