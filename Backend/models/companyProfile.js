const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CompanyProfile = sequelize.define(
    "CompanyProfile",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      companyName: { type: DataTypes.STRING, allowNull: true },
      tagLine: { type: DataTypes.STRING, allowNull: true },
      businessType: { type: DataTypes.STRING, allowNull: true },
      ownerName: { type: DataTypes.STRING, allowNull: true },
      mobileNo: { type: DataTypes.STRING, allowNull: true },
      phoneNo: { type: DataTypes.STRING, allowNull: true },
      faxNo: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true },
      taxNumber: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
      timeZone: { type: DataTypes.STRING, allowNull: true },
      currencyCode: { type: DataTypes.STRING(10), allowNull: true },
      currencySymbol: { type: DataTypes.STRING(10), allowNull: true },
      prefixCategory: { type: DataTypes.STRING(20), allowNull: true },
      prefixItem: { type: DataTypes.STRING(20), allowNull: true },
      prefixSupplier: { type: DataTypes.STRING(20), allowNull: true },
      prefixPurchase: { type: DataTypes.STRING(20), allowNull: true },
      prefixCustomer: { type: DataTypes.STRING(20), allowNull: true },
      prefixSales: { type: DataTypes.STRING(20), allowNull: true },
      prefixExpenses: { type: DataTypes.STRING(20), allowNull: true },
    },
    { tableName: "company_profiles", timestamps: true }
  );
  return CompanyProfile;
};
