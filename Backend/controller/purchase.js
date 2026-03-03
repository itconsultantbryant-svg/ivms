const { Purchase, Product } = require("../models");
const purchaseStock = require("./purchaseStock");

const addPurchase = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const productID = parseInt(req.body.productID, 10);
    const quantityPurchased = parseInt(req.body.quantityPurchased, 10);
    const totalPurchaseAmount = parseFloat(req.body.totalPurchaseAmount) || 0;
    const purchaseDate = req.body.purchaseDate || "";

    if (!userID || !productID || !purchaseDate) {
      return res.status(400).json({ error: "Missing required fields: userID, productID, purchaseDate" });
    }
    if (isNaN(quantityPurchased) || quantityPurchased < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const row = await Purchase.create({
      userID,
      productID,
      quantityPurchased,
      purchaseDate,
      totalPurchaseAmount,
    });
    await purchaseStock(productID, quantityPurchased);
    res.status(200).json(row);
  } catch (err) {
    console.error("Purchase add error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const getPurchaseData = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Purchase.findAll({
      where: { userID },
      order: [["id", "DESC"]],
      include: [{ model: Product, as: "Product", attributes: ["id", "name", "manufacturer", "stock"] }],
    });
    const mapped = list.map((p) => {
      const d = p.get({ plain: true });
      const out = { ...d, _id: p.id, ProductID: d.Product || { id: d.productID, name: "", manufacturer: "", stock: 0 } };
      if (out.ProductID && !out.ProductID._id) out.ProductID._id = out.ProductID.id;
      return out;
    });
    res.json(mapped);
  } catch (err) {
    console.error("Purchase getPurchaseData:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getTotalPurchaseAmount = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const rows = await Purchase.findAll({ where: { userID }, attributes: ["totalPurchaseAmount"] });
    const totalPurchaseAmount = rows.reduce((sum, p) => sum + Number(p.totalPurchaseAmount), 0);
    res.json({ totalPurchaseAmount: Number(totalPurchaseAmount) });
  } catch (err) {
    console.error("Purchase getTotalPurchaseAmount:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getMonthlyPurchases = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const rows = await Purchase.findAll({
      where: { userID },
      attributes: ["purchaseDate", "totalPurchaseAmount"],
    });
    const purchaseAmount = Array(12).fill(0);
    rows.forEach((p) => {
      const monthIndex = parseInt(String(p.purchaseDate).split("-")[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) purchaseAmount[monthIndex] += Number(p.totalPurchaseAmount);
    });
    res.json({ purchaseAmount });
  } catch (err) {
    console.error("Purchase getMonthlyPurchases:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const purchase = await Purchase.findByPk(id);
    if (!purchase || purchase.userID !== parseInt(req.body.userID, 10)) return res.status(404).json({ error: "Not found" });
    const oldQty = purchase.quantityPurchased || 0;
    const newQty = parseInt(req.body.quantityPurchased, 10) || oldQty;
    const newTotal = parseFloat(req.body.totalPurchaseAmount) || purchase.totalPurchaseAmount;
    const newDate = req.body.purchaseDate || purchase.purchaseDate;
    await purchase.update({ quantityPurchased: newQty, totalPurchaseAmount: newTotal, purchaseDate: newDate });
    if (newQty !== oldQty) {
      const product = await Product.findByPk(purchase.productID);
      if (product) await product.update({ stock: Math.max(0, (product.stock || 0) - oldQty + newQty) });
    }
    res.json(await Purchase.findByPk(id, { include: [{ model: Product, as: "Product", attributes: ["id", "name"] }] }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const purchase = await Purchase.findByPk(id);
    if (!purchase) return res.status(404).json({ error: "Not found" });
    const product = await Product.findByPk(purchase.productID);
    if (product) await product.update({ stock: Math.max(0, (product.stock || 0) - (purchase.quantityPurchased || 0)) });
    await purchase.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addPurchase, getPurchaseData, getTotalPurchaseAmount, getMonthlyPurchases, updatePurchase, deletePurchase };
