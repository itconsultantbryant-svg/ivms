const { Supplier } = require("../models");

const add = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const name = String(req.body.name || "").trim();
    if (!userID) return res.status(400).json({ error: "userID required" });
    const row = await Supplier.create({
      userID,
      code: req.body.code || null,
      name: name || null,
      mobile: req.body.mobile || null,
      email: req.body.email || null,
      address: req.body.address || null,
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
    const list = await Supplier.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((s) => ({ ...s.get({ plain: true }), _id: s.id })));
  } catch (err) {
    console.error("Supplier getAll:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const row = await Supplier.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.update({
      code: req.body.code !== undefined ? req.body.code : row.code,
      name: req.body.name !== undefined ? req.body.name : row.name,
      mobile: req.body.mobile !== undefined ? req.body.mobile : row.mobile,
      email: req.body.email !== undefined ? req.body.email : row.email,
      address: req.body.address !== undefined ? req.body.address : row.address,
    });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const row = await Supplier.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { add, getAll, update, remove };
