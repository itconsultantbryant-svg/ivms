const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Purchase = sequelize.define(
    "Purchase",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      productID: { type: DataTypes.INTEGER, allowNull: false },
      quantityPurchased: { type: DataTypes.INTEGER, allowNull: false },
      purchaseDate: { type: DataTypes.STRING, allowNull: false },
      totalPurchaseAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    },
    { tableName: "purchases", timestamps: true }
  );
  return Purchase;
};
