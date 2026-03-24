const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      /** Alert when total units in this category are at or below this level */
      lowStockThreshold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
      /** Target “healthy” stock level for the category (for display / planning) */
      targetStock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { tableName: "categories", timestamps: true }
  );
  return Category;
};
