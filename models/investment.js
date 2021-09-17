'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Investment.belongsTo(models.Package, {
        foreignKey: "package_id",
        as: "package",
      });
      Investment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }

  }
  
  Investment.init({
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
    package_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    status: {
      allowNull: true,
      type: DataTypes.ENUM("active","inactive"),
      defaultValue: "active"
    },
    amount: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    earning: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weeklyEarning: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    expiredAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
    
  }, {
    sequelize,
    modelName: 'Investment',
    timestamps: true,
    paranoid: true,
    tableName: 'Investments',
  });
  // Investment.sync({force: true})
  return Investment;
};