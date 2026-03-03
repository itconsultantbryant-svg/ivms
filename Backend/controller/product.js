const { Product, Purchase, Sales } = require("../models");
const { Op } = require("sequelize");

const addProduct = async (req, res) => {
  try {
    const product = await Product.create({
      userID: req.body.userId,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      stock: 0,
      description: req.body.description || null,
    });
    res.status(200).json(product);
  } catch (err) {
    res.status(402).json({ error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const userID = parseInt(req.params.userId, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userId" });
    const list = await Product.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((p) => ({ ...p.get({ plain: true }), _id: p.id })));
  } catch (err) {
    console.error("Product getAllProducts:", err.message);
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
    await product.update({
      name: req.body.name !== undefined ? req.body.name : product.name,
      manufacturer: req.body.manufacturer !== undefined ? req.body.manufacturer : product.manufacturer,
      description: req.body.description !== undefined ? req.body.description : product.description,
    });
    res.json(product);
  } catch (err) {
    res.status(402).json({ error: err.message });
  }
};

const searchProduct = async (req, res) => {
  const term = req.query.searchTerm || "";
  try {
    const list = await Product.findAll({ where: { name: { [Op.iLike]: "%" + term + "%" } } });
    res.json(list.map((p) => ({ ...p.get({ plain: true }), _id: p.id })));
  } catch (e) {
    const list = await Product.findAll({ where: { name: { [Op.like]: "%" + term + "%" } } });
    res.json(list.map((p) => ({ ...p.get({ plain: true }), _id: p.id })));
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};
