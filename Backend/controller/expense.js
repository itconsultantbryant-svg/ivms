const { Expense } = require("../models");

const add = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    if (!userID) return res.status(400).json({ error: "userID required" });
    const row = await Expense.create({
      userID,
      date: req.body.date || null,
      category: req.body.category || null,
      amount: parseFloat(req.body.amount) || 0,
      note: req.body.note || null,
    });
    res.status(200).json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Expense.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((e) => ({ ...e.get({ plain: true }), _id: e.id })));
  } catch (err) {
    console.error("Expense getAll:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const row = await Expense.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.update({
      date: req.body.date !== undefined ? req.body.date : row.date,
      category: req.body.category !== undefined ? req.body.category : row.category,
      amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : row.amount,
      note: req.body.note !== undefined ? req.body.note : row.note,
    });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const row = await Expense.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { add, getAll, update, remove };
