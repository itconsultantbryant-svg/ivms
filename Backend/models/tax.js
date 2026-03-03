const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tax = sequelize.define(
    "Tax",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.STRING(10), allowNull: true, defaultValue: "ON" },
    },
    { tableName: "taxes", timestamps: true }
  );
  return Tax;
};
