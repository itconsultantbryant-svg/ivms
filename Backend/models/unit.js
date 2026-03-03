const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Unit = sequelize.define(
    "Unit",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      note: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING(10), allowNull: true, defaultValue: "ON" },
    },
    { tableName: "units", timestamps: true }
  );
  return Unit;
};
