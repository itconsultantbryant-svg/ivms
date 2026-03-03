const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserRole = sequelize.define(
    "UserRole",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      roleID: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "user_roles", timestamps: true }
  );
  return UserRole;
};
