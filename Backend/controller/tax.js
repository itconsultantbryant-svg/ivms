const { Tax } = require("../models");

const addTax = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const name = String(req.body.name || "").trim();
    const rate = parseFloat(req.body.rate) || 0;
    if (!userID || !name) return res.status(400).json({ error: "userID and name required" });
    const row = await Tax.create({ userID, name, rate, status: req.body.status || "ON" });
    res.status(200).json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllTaxes = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Tax.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((t) => ({ ...t.get({ plain: true }), _id: t.id })));
  } catch (err) {
    console.error("Tax getAllTaxes:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateTax = async (req, res) => {
  try {
    const row = await Tax.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.update({
      name: req.body.name !== undefined ? req.body.name : row.name,
      rate: req.body.rate !== undefined ? parseFloat(req.body.rate) : row.rate,
      status: req.body.status !== undefined ? req.body.status : row.status,
    });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteTax = async (req, res) => {
  try {
    const row = await Tax.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addTax, getAllTaxes, updateTax, deleteTax };
