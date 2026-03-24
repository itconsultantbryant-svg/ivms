const { Product, Purchase, Sales, Category } = require("../models");
const { Op } = require("sequelize");

const MAX_INT = 2147483647;

const addProduct = async (req, res) => {
  try {
    const userID = parseInt(req.body.userId, 10);
    const name = String(req.body.name || "").trim();
    const manufacturer = String(req.body.manufacturer || "").trim();
    if (!userID || userID < 1 || userID > MAX_INT) {
      return res.status(400).json({ error: "Invalid userId (must be a valid database user id)" });
    }
    if (!name || !manufacturer) {
      return res.status(400).json({ error: "name and manufacturer are required" });
    }
    const stock = Math.max(0, parseInt(req.body.stock ?? req.body.initialStock ?? 0, 10) || 0);
    const categoryID =
      req.body.categoryID === undefined || req.body.categoryID === "" || req.body.categoryID === null
        ? null
        : parseInt(req.body.categoryID, 10);
    const barcode = req.body.barcode != null && String(req.body.barcode).trim() !== "" ? String(req.body.barcode).trim() : null;
    const unitPrice = parseFloat(req.body.unitPrice);
    const product = await Product.create({
      userID,
      name,
      manufacturer,
      categoryID: categoryID && !Number.isNaN(categoryID) ? categoryID : null,
      barcode,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      stock,
      description: req.body.description || null,
    });
    const u = product.get({ plain: true });
    res.status(200).json({ ...u, _id: product.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const userID = parseInt(req.params.userId, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userId" });
    const list = await Product.findAll({
      where: { userID },
      order: [["id", "DESC"]],
      include: [{ model: Category, as: "Category", attributes: ["id", "name", "lowStockThreshold", "targetStock"], required: false }],
    });
    res.json(
      list.map((p) => {
        const plain = p.get({ plain: true });
        return { ...plain, _id: p.id };
      })
    );
  } catch (err) {
    console.error("Product getAllProducts:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const findByBarcode = async (req, res) => {
  try {
    const userID = parseInt(req.query.userId, 10);
    const code = String(req.query.code || "").trim();
    if (!userID || !code) return res.status(400).json({ error: "userId and code query params are required" });
    const product = await Product.findOne({
      where: { userID, barcode: code },
      include: [{ model: Category, as: "Category", attributes: ["id", "name", "lowStockThreshold", "targetStock"], required: false }],
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    const u = product.get({ plain: true });
    res.json({ ...u, _id: product.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Selected Product (Sequelize)
const deleteSelectedProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    await Purchase.destroy({ where: { productID: id } });
    await Sales.destroy({ where: { productID: id } });
    await product.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSelectedProduct = async (req, res) => {
  try {
    const productID = parseInt(req.body.productID, 10);
    if (!productID) return res.status(400).json({ error: "productID required" });
    const product = await Product.findByPk(productID);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const payload = {
      name: req.body.name !== undefined ? String(req.body.name).trim() : product.name,
      manufacturer: req.body.manufacturer !== undefined ? String(req.body.manufacturer).trim() : product.manufacturer,
      description: req.body.description !== undefined ? req.body.description : product.description,
    };
    if (req.body.categoryID !== undefined) {
      payload.categoryID =
        req.body.categoryID === null || req.body.categoryID === ""
          ? null
          : parseInt(req.body.categoryID, 10);
    }
    if (req.body.barcode !== undefined) {
      payload.barcode = req.body.barcode != null && String(req.body.barcode).trim() !== "" ? String(req.body.barcode).trim() : null;
    }
    if (req.body.unitPrice !== undefined) {
      const up = parseFloat(req.body.unitPrice);
      payload.unitPrice = Number.isFinite(up) ? up : product.unitPrice;
    }
    if (req.body.stock !== undefined) {
      payload.stock = Math.max(0, parseInt(req.body.stock, 10) || 0);
    }
    await product.update(payload);
    const updated = await Product.findByPk(productID, {
      include: [{ model: Category, as: "Category", attributes: ["id", "name", "lowStockThreshold", "targetStock"], required: false }],
    });
    const u = updated.get({ plain: true });
    res.json({ ...u, _id: updated.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchProduct = async (req, res) => {
  const term = req.query.searchTerm || "";
  try {
    const list = await Product.findAll({
      where: { name: { [Op.iLike]: "%" + term + "%" } },
      include: [{ model: Category, as: "Category", attributes: ["id", "name"], required: false }],
    });
    res.json(list.map((p) => ({ ...p.get({ plain: true }), _id: p.id })));
  } catch (e) {
    const list = await Product.findAll({
      where: { name: { [Op.like]: "%" + term + "%" } },
      include: [{ model: Category, as: "Category", attributes: ["id", "name"], required: false }],
    });
    res.json(list.map((p) => ({ ...p.get({ plain: true }), _id: p.id })));
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
  findByBarcode,
};
