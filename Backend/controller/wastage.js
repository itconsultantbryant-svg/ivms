const { Wastage, Product } = require("../models");

const add = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const productID = req.body.productID ? parseInt(req.body.productID, 10) : null;
    const quantity = parseInt(req.body.quantity, 10) || 0;
    const date = req.body.date || null;
    const note = req.body.note || null;
    if (!userID) return res.status(400).json({ error: "userID required" });
    const row = await Wastage.create({ userID, productID, quantity, date, note });
    if (productID && quantity > 0) {
      const product = await Product.findByPk(productID);
      if (product) await product.update({ stock: Math.max(0, (product.stock || 0) - quantity) });
    }
    res.status(200).json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Wastage.findAll({
      where: { userID },
      order: [["id", "DESC"]],
      include: [{ model: Product, as: "Product", attributes: ["id", "name", "stock"] }],
    });
    const mapped = list.map((w) => {
      const d = w.get({ plain: true });
      return { ...d, _id: w.id, ProductID: d.Product || { id: d.productID, name: "" } };
    });
    res.json(mapped);
  } catch (err) {
    console.error("Wastage getAll:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const row = await Wastage.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    const oldQty = row.quantity || 0;
    const newQty = parseInt(req.body.quantity, 10) ?? oldQty;
    const newDate = req.body.date !== undefined ? req.body.date : row.date;
    const newNote = req.body.note !== undefined ? req.body.note : row.note;
    if (row.productID && oldQty !== newQty) {
      const product = await Product.findByPk(row.productID);
      if (product) await product.update({ stock: Math.max(0, (product.stock || 0) + oldQty - newQty) });
    }
    await row.update({ quantity: newQty, date: newDate, note: newNote });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const row = await Wastage.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    const qty = row.quantity || 0;
    if (row.productID && qty > 0) {
      const product = await Product.findByPk(row.productID);
      if (product) await product.update({ stock: (product.stock || 0) + qty });
    }
    await row.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { add, getAll, update, remove };
