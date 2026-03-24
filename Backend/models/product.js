const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      manufacturer: { type: DataTypes.STRING, allowNull: false },
      categoryID: { type: DataTypes.INTEGER, allowNull: true },
      barcode: { type: DataTypes.STRING, allowNull: true },
      unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      description: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "products", timestamps: true }
  );
  return Product;
};
