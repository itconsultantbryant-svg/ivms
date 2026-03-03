const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RolePermission = sequelize.define(
    "RolePermission",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      roleID: { type: DataTypes.INTEGER, allowNull: false },
      module: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "role_permissions", timestamps: true }
  );
  return RolePermission;
};
