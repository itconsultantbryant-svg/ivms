const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Expense = sequelize.define(
    "Expense",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: true },
      category: { type: DataTypes.STRING, allowNull: true },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      note: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "expenses", timestamps: true }
  );
  return Expense;
};
