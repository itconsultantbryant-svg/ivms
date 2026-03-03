const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Sales = sequelize.define(
    "Sales",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      productID: { type: DataTypes.INTEGER, allowNull: false },
      storeID: { type: DataTypes.INTEGER, allowNull: false },
      stockSold: { type: DataTypes.INTEGER, allowNull: false },
      saleDate: { type: DataTypes.STRING, allowNull: false },
      totalSaleAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    },
    { tableName: "sales", timestamps: true }
  );
  return Sales;
};
