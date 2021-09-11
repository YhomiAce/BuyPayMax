'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  card.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    name: {
        allowNull: true,
        type: DataTypes.STRING
    },
    rate: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    charge: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Card',
    tableName: 'gift_cards',
    timestamps: true,
    paranoid: true
  });
  return card;
};