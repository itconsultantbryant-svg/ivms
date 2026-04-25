const { Sequelize } = require("sequelize");
const config = require("../config/database");

let sequelize;
if (config.dialect === "sqlite") {
  sequelize = new Sequelize({ dialect: "sqlite", storage: config.storage, logging: config.logging });
} else {
  sequelize = new Sequelize(config.url, {
    logging: config.logging,
    dialectOptions: config.dialectOptions,
  });
}

const User = require("./User")(sequelize);
const Product = require("./product")(sequelize);
const Store = require("./store")(sequelize);
const Purchase = require("./purchase")(sequelize);
const Sales = require("./sales")(sequelize);
const Tax = require("./tax")(sequelize);
const Unit = require("./unit")(sequelize);
const CompanyProfile = require("./companyProfile")(sequelize);
const Customer = require("./customer")(sequelize);
const Supplier = require("./supplier")(sequelize);
const Expense = require("./expense")(sequelize);
const Category = require("./category")(sequelize);
const Wastage = require("./wastage")(sequelize);
const Role = require("./role")(sequelize);
const RolePermission = require("./rolePermission")(sequelize);
const UserRole = require("./userRole")(sequelize);

User.hasMany(Product, { foreignKey: "userID" });
Product.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Store, { foreignKey: "userID" });
Store.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Purchase, { foreignKey: "userID" });
Purchase.belongsTo(Product, { foreignKey: "productID" });
Product.hasMany(Purchase, { foreignKey: "productID" });
Purchase.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Sales, { foreignKey: "userID" });
Product.hasMany(Sales, { foreignKey: "productID" });
Store.hasMany(Sales, { foreignKey: "storeID" });
Sales.belongsTo(User, { foreignKey: "userID" });
Sales.belongsTo(Product, { foreignKey: "productID" });
Sales.belongsTo(Store, { foreignKey: "storeID" });

User.hasMany(Tax, { foreignKey: "userID" });
Tax.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Unit, { foreignKey: "userID" });
Unit.belongsTo(User, { foreignKey: "userID" });

User.hasMany(CompanyProfile, { foreignKey: "userID" });
CompanyProfile.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Customer, { foreignKey: "userID" });
Customer.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Supplier, { foreignKey: "userID" });
Supplier.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Expense, { foreignKey: "userID" });
Expense.belongsTo(User, { foreignKey: "userID" });

User.hasMany(Category, { foreignKey: "userID" });
Category.belongsTo(User, { foreignKey: "userID" });

Category.hasMany(Product, { foreignKey: "categoryID" });
Product.belongsTo(Category, { foreignKey: "categoryID" });

User.hasMany(Wastage, { foreignKey: "userID" });
Wastage.belongsTo(User, { foreignKey: "userID" });
Wastage.belongsTo(Product, { foreignKey: "productID" });
Product.hasMany(Wastage, { foreignKey: "productID" });

User.hasMany(Role, { foreignKey: "userID" });
Role.belongsTo(User, { foreignKey: "userID" });
Role.hasMany(RolePermission, { foreignKey: "roleID" });
RolePermission.belongsTo(Role, { foreignKey: "roleID" });
User.belongsToMany(Role, { through: UserRole, foreignKey: "userID", otherKey: "roleID" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "roleID", otherKey: "userID" });

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");
    const isProduction = process.env.NODE_ENV === "production";
    // Safer defaults: do not auto-alter schema on production databases.
    // Enable only when explicitly requested with DB_SYNC_ALTER=1.
    const shouldAlter =
      process.env.DB_SYNC_ALTER != null
        ? process.env.DB_SYNC_ALTER === "1"
        : !isProduction;
    await sequelize.sync({ alter: shouldAlter });
    console.log("Tables synced.");
  } catch (err) {
    console.error("Database error:", err.message);
  }
}

module.exports = { sequelize, main, User, Product, Store, Purchase, Sales, Tax, Unit, CompanyProfile, Customer, Supplier, Expense, Category, Wastage, Role, RolePermission, UserRole };
