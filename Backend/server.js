const express = require("express");
const { main, User, Product, Role, UserRole, RolePermission } = require("./models");
const { Op } = require("sequelize");
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

const configuredOrigins = String(process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  // Keep local tools/postman working (no origin) and allow explicit frontend origins.
  // If FRONTEND_URL is empty, fallback to permissive behavior for easier first deploy.
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (configuredOrigins.length === 0) return callback(null, true);
    if (configuredOrigins.includes(origin)) return callback(null, true);
    try {
      const host = new URL(origin).hostname;
      if (host.endsWith(".vercel.app")) return callback(null, true);
    } catch (_) {
      // Ignore malformed Origin and continue to rejection below.
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.options("*", cors(corsOptions));

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

// Compatibility: also mount routes without the `/api` prefix.
// This prevents production 404s when the frontend API base URL is misconfigured.
app.use("/store", storeRoute);
app.use("/product", productRoute);
app.use("/purchase", purchaseRoute);
app.use("/sales", salesRoute);
app.use("/tax", taxRoute);
app.use("/unit", unitRoute);
app.use("/company-profile", companyProfileRoute);
app.use("/customers", customerRoute);
app.use("/suppliers", supplierRoute);
app.use("/expenses", expenseRoute);
app.use("/categories", categoryRoute);
app.use("/wastage", wastageRoute);
app.use("/roles", roleRoute);

let userAuthCheck = null;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const loginHandler = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { email: req.body.email }],
        password,
      },
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
};

app.post("/api/login", loginHandler);

// Compatibility route: allow POST `/login` (without `/api` prefix).
app.post("/login", loginHandler);

app.get("/api/login", (req, res) => {
  if (!userAuthCheck) return res.status(401).json(null);
  res.json({ ...userAuthCheck, _id: userAuthCheck.id });
});

// Compatibility route: allow GET `/login` (without `/api` prefix).
app.get("/login", (req, res) => {
  if (!userAuthCheck) return res.status(401).json(null);
  res.json({ ...userAuthCheck, _id: userAuthCheck.id });
});

const registerHandler = async (req, res) => {
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: normalizeEmail(req.body.email),
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
};

app.post("/api/register", registerHandler);

// Compatibility route: allow POST `/register` (without `/api` prefix).
app.post("/register", registerHandler);

app.get("/api/users/:userID", async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const user = await User.findByPk(userID, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const u = user.get({ plain: true });
    res.json({ ...u, _id: u.id });
  } catch (err) {
    console.error("GET /api/users/:userID:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/users/:userID", async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const user = await User.findByPk(userID, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const u = user.get({ plain: true });
    res.json({ ...u, _id: u.id });
  } catch (err) {
    console.error("GET /users/:userID:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const updateUserProfileHandler = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const user = await User.findByPk(userID);
    if (!user) return res.status(404).json({ error: "User not found" });

    const payload = {};
    if (req.body.firstName !== undefined) payload.firstName = String(req.body.firstName || "").trim();
    if (req.body.lastName !== undefined) payload.lastName = String(req.body.lastName || "").trim();
    if (req.body.email !== undefined) payload.email = normalizeEmail(req.body.email);
    if (req.body.phoneNumber !== undefined) payload.phoneNumber = req.body.phoneNumber || null;
    if (req.body.imageUrl !== undefined) payload.imageUrl = req.body.imageUrl || null;
    if (req.body.password !== undefined && String(req.body.password).trim() !== "") {
      payload.password = String(req.body.password);
    }

    await user.update(payload);
    const updated = await User.findByPk(userID, { attributes: { exclude: ["password"] } });
    const u = updated.get({ plain: true });
    res.json({ ...u, _id: u.id });
  } catch (err) {
    console.error("PUT /api/users/:userID/profile:", err.message);
    res.status(500).json({ error: err.message });
  }
};

app.put("/api/users/:userID/profile", updateUserProfileHandler);
app.put("/users/:userID/profile", updateUserProfileHandler);

app.get("/api/users", async (req, res) => {
  try {
    const list = await User.findAll({ order: [["id", "DESC"]], attributes: { exclude: ["password"] } });
    res.json(list.map((u) => ({ ...u.get({ plain: true }), _id: u.id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compatibility route (in case frontend API base URL is without `/api`).
app.get("/users", async (req, res) => {
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

// Compatibility route (in case frontend API base URL is without `/api`).
app.get("/users/:userID/permissions", async (req, res) => {
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
    console.error("GET /users/:userID/permissions:", err.message);
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

// Compatibility route (in case frontend API base URL is without `/api`).
app.get("/users/:userID/roles", async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const userRoles = await UserRole.findAll({ where: { userID }, attributes: ["roleID"] });
    const roleIDs = userRoles.map((ur) => ur.roleID).filter(Boolean);
    if (roleIDs.length === 0) return res.json([]);
    const roles = await Role.findAll({ where: { id: roleIDs }, attributes: ["id", "name"] });
    res.json(roles.map((r) => ({ _id: r.id, id: r.id, name: r.name })));
  } catch (err) {
    console.error("GET /users/:userID/roles:", err.message);
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

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
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
