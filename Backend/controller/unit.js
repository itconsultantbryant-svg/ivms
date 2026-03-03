const { Unit } = require("../models");

const addUnit = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const name = String(req.body.name || "").trim();
    if (!userID || !name) return res.status(400).json({ error: "userID and name required" });
    const row = await Unit.create({
      userID,
      name,
      note: req.body.note || "",
      status: req.body.status || "ON",
    });
    res.status(200).json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllUnits = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Unit.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((u) => ({ ...u.get({ plain: true }), _id: u.id })));
  } catch (err) {
    console.error("Unit getAllUnits:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateUnit = async (req, res) => {
  try {
    const row = await Unit.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.update({
      name: req.body.name !== undefined ? req.body.name : row.name,
      note: req.body.note !== undefined ? req.body.note : row.note,
      status: req.body.status !== undefined ? req.body.status : row.status,
    });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const row = await Unit.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addUnit, getAllUnits, updateUnit, deleteUnit };
