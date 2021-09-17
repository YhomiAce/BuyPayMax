'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Package.hasMany(models.Investment, {
        foreignKey: "package_id",
        as: "investment"
      });
    }
    
    
  };
  Package.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    fromPrice: {
      allowNull: false,
      type: DataTypes.FLOAT
    },
    toPrice: {
      allowNull: false,
      type: DataTypes.FLOAT
    },
    commission: {
      allowNull: false,
      type: DataTypes.FLOAT
    },
    duration: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    charge: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    bonus:{
      allowNull: true,
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Package',
    timestamps: true,
    paranoid: true,
    tableName: 'Packages',
  });
  return Package;
};