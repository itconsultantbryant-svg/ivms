const { Store } = require("../models");

const addStore = async (req, res) => {
  try {
    const store = await Store.create({
      userID: req.body.userId,
      name: req.body.name,
      category: req.body.category,
      address: req.body.address,
      city: req.body.city,
      image: req.body.image || "",
    });
    res.status(200).json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllStores = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Store.findAll({
      where: { userID },
      order: [["id", "DESC"]],
    });
    res.json(list.map((s) => ({ ...s.get({ plain: true }), _id: s.id })));
  } catch (err) {
    console.error("Store getAllStores:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateStore = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: "Not found" });
    await store.update({
      name: req.body.name ?? store.name,
      category: req.body.category ?? store.category,
      address: req.body.address ?? store.address,
      city: req.body.city ?? store.city,
      image: req.body.image !== undefined ? req.body.image : store.image,
    });
    const d = store.get({ plain: true });
    res.json({ ...d, _id: store.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteStore = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: "Not found" });
    await store.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addStore, getAllStores, updateStore, deleteStore };
