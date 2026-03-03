const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Wastage = sequelize.define(
    "Wastage",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      productID: { type: DataTypes.INTEGER, allowNull: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      date: { type: DataTypes.DATEONLY, allowNull: true },
      note: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "wastages", timestamps: true }
  );
  return Wastage;
};
