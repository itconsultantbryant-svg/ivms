const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      code: { type: DataTypes.STRING, allowNull: true },
      name: { type: DataTypes.STRING, allowNull: true },
      mobile: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "suppliers", timestamps: true }
  );
  return Supplier;
};
