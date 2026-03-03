const { Role, RolePermission } = require("../models");

const add = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const name = String(req.body.name || "").trim();
    if (!userID || !name) return res.status(400).json({ error: "userID and name required" });
    const row = await Role.create({ userID, name });
    res.status(200).json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Role.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((r) => ({ ...r.get({ plain: true }), _id: r.id })));
  } catch (err) {
    console.error("Role getAll:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const row = await Role.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await row.update({ name: req.body.name !== undefined ? req.body.name : row.name });
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const row = await Role.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    await RolePermission.destroy({ where: { roleID: row.id } });
    await row.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPermissions = async (req, res) => {
  try {
    const list = await RolePermission.findAll({
      where: { roleID: req.params.roleID },
      attributes: ["id", "module"],
    });
    res.json(list.map((p) => ({ ...p.get({ plain: true }), _id: p.id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const setPermissions = async (req, res) => {
  try {
    const roleID = parseInt(req.params.roleID, 10);
    const modules = Array.isArray(req.body.modules) ? req.body.modules : [];
    const role = await Role.findByPk(roleID);
    if (!role) return res.status(404).json({ error: "Role not found" });
    await RolePermission.destroy({ where: { roleID } });
    const rows = await Promise.all(
      modules.filter(Boolean).map((m) => RolePermission.create({ roleID, module: String(m).trim() }))
    );
    res.json(rows.map((r) => ({ ...r.get({ plain: true }), _id: r.id })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { add, getAll, update, remove, getPermissions, setPermissions };
