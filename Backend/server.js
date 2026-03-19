const express = require("express");
const { main, User, Product, Role, UserRole, RolePermission } = require("./models");
const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const taxRoute = require("./router/tax");
const unitRoute = require("./router/unit");
const companyProfileRoute = require("./router/companyProfile");
const customerRoute = require("./router/customer");
const supplierRoute = require("./router/supplier");
const expenseRoute = require("./router/expense");
const categoryRoute = require("./router/category");
const wastageRoute = require("./router/wastage");
const roleRoute = require("./router/role");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
};
app.use(express.json());
app.use(cors(corsOptions));

async function start() {
  await main();
  // Ensure a known admin account exists for deployments (e.g. Render).
  // This avoids "wrong credentials" when the Render database already contains users.
  const defaultAdmin = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "admin123",
  };

  try {
    const admin = await User.findOne({ where: { email: defaultAdmin.email } });
    if (!admin) {
      await User.create(defaultAdmin);
    } else if (admin.password !== defaultAdmin.password) {
      await admin.update({ password: defaultAdmin.password });
    }
    console.log("Default login: admin@example.com / admin123");
  } catch (err) {
    console.log("Default admin setup:", err.message);
  }
}

app.use("/api/store", storeRoute);
app.use("/api/product", productRoute);
app.use("/api/purchase", purchaseRoute);
app.use("/api/sales", salesRoute);
app.use("/api/tax", taxRoute);
app.use("/api/unit", unitRoute);
app.use("/api/company-profile", companyProfileRoute);
app.use("/api/customers", customerRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/expenses", expenseRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/wastage", wastageRoute);
app.use("/api/roles", roleRoute);

let userAuthCheck = null;

app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email, password: req.body.password },
    });
    if (user) {
      const u = user.get({ plain: true });
      res.json({ ...u, _id: u.id });
      userAuthCheck = u;
    } else {
      userAuthCheck = null;
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

app.get("/api/login", (req, res) => {
  if (!userAuthCheck) return res.status(401).json(null);
  res.json({ ...userAuthCheck, _id: userAuthCheck.id });
});

app.post("/api/register", async (req, res) => {
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber || null,
      imageUrl: req.body.imageUrl || null,
    });
    const u = user.get({ plain: true });
    res.status(200).json({ ...u, _id: u.id });
  } catch (err) {
    console.error("Signup:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const list = await User.findAll({ order: [["id", "DESC"]], attributes: { exclude: ["password"] } });
    res.json(list.map((u) => ({ ...u.get({ plain: true }), _id: u.id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:userID/permissions", async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const userRoles = await UserRole.findAll({ where: { userID }, attributes: ["roleID"] });
    const roleIDs = userRoles.map((ur) => ur.roleID);
    if (roleIDs.length === 0) return res.json({ modules: null });
    const perms = await RolePermission.findAll({ where: { roleID: roleIDs }, attributes: ["module"] });
    const modules = [...new Set(perms.map((p) => p.module))];
    res.json({ modules });
  } catch (err) {
    console.error("GET /api/users/:userID/permissions:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:userID/roles", async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const userRoles = await UserRole.findAll({ where: { userID }, attributes: ["roleID"] });
    const roleIDs = userRoles.map((ur) => ur.roleID).filter(Boolean);
    if (roleIDs.length === 0) return res.json([]);
    const roles = await Role.findAll({ where: { id: roleIDs }, attributes: ["id", "name"] });
    res.json(roles.map((r) => ({ _id: r.id, id: r.id, name: r.name })));
  } catch (err) {
    console.error("GET /api/users/:userID/roles:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/user-roles", async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const roleID = parseInt(req.body.roleID, 10);
    if (!userID || !roleID) return res.status(400).json({ error: "userID and roleID required" });
    const [row] = await UserRole.findOrCreate({ where: { userID, roleID }, defaults: { userID, roleID } });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/user-roles/:userID/:roleID", async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    const roleID = parseInt(req.params.roleID, 10);
    await UserRole.destroy({ where: { userID, roleID } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/testget", (req, res) => {
  res.json({ message: "Backend running with SQLite/PostgreSQL" });
});

start()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
  });
