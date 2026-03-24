const { Category } = require("../models");

const MAX_INT = 2147483647;

const add = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const name = String(req.body.name || "").trim();
    if (!userID || userID < 1 || userID > MAX_INT || !name) {
      return res.status(400).json({
        error: "userID and name are required (userID must fit a database integer and reference an existing user)",
      });
    }
    const lowStockThreshold = Math.max(0, parseInt(req.body.lowStockThreshold ?? 5, 10) || 0);
    const targetStock = Math.max(0, parseInt(req.body.targetStock ?? 0, 10) || 0);
    const row = await Category.create({ userID, name, lowStockThreshold, targetStock });
    res.status(200).json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Category.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((c) => ({ ...c.get({ plain: true }), _id: c.id })));
  } catch (err) {
    console.error("Category getAll:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const row = await Category.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.update({
      name: req.body.name !== undefined ? String(req.body.name).trim() : row.name,
      lowStockThreshold:
        req.body.lowStockThreshold !== undefined
          ? Math.max(0, parseInt(req.body.lowStockThreshold, 10) || 0)
          : row.lowStockThreshold,
      targetStock:
        req.body.targetStock !== undefined ? Math.max(0, parseInt(req.body.targetStock, 10) || 0) : row.targetStock,
    });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const row = await Category.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { add, getAll, update, remove };
