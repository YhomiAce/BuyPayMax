'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class coin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  coin.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name:{
      type:DataTypes.STRING,
      allowNull: false
    },
    rate:{
      type:DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    description:{
      type:DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'coin',
    tableName:"coins",
    timestamps: true,
    paranoid: true
  });
  return coin;
};