const { Sales, Product, Store } = require("../models");
const soldStock = require("./soldStock");

const addSales = async (req, res) => {
  try {
    const row = await Sales.create({
      userID: req.body.userID,
      productID: req.body.productID,
      storeID: req.body.storeID,
      stockSold: req.body.stockSold,
      saleDate: req.body.saleDate,
      totalSaleAmount: req.body.totalSaleAmount,
    });
    await soldStock(req.body.productID, req.body.stockSold);
    res.status(200).json(row);
  } catch (err) {
    res.status(402).json({ error: err.message });
  }
};

const getSalesData = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const list = await Sales.findAll({
      where: { userID },
      order: [["id", "DESC"]],
      include: [
        { model: Product, as: "Product", attributes: ["id", "name", "manufacturer", "stock"] },
        { model: Store, as: "Store", attributes: ["id", "name", "category", "address", "city"] },
      ],
    });
    const mapped = list.map((s) => {
      const d = s.get({ plain: true });
      const out = {
        ...d,
        _id: s.id,
        ProductID: d.Product || { id: d.productID, _id: d.productID },
        StoreID: d.Store || { id: d.storeID, _id: d.storeID },
      };
      if (out.ProductID && !out.ProductID._id) out.ProductID._id = out.ProductID.id;
      if (out.StoreID && !out.StoreID._id) out.StoreID._id = out.StoreID.id;
      return out;
    });
    res.json(mapped);
  } catch (err) {
    console.error("Sales getSalesData:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getTotalSalesAmount = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const rows = await Sales.findAll({ where: { userID }, attributes: ["totalSaleAmount"] });
    const totalSaleAmount = rows.reduce((sum, s) => sum + Number(s.totalSaleAmount), 0);
    res.json({ totalSaleAmount: Number(totalSaleAmount) });
  } catch (err) {
    console.error("Sales getTotalSalesAmount:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const rows = await Sales.findAll({ attributes: ["saleDate", "totalSaleAmount"] });
    const salesAmount = Array(12).fill(0);
    rows.forEach((s) => {
      const monthIndex = parseInt(String(s.saleDate).split("-")[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) salesAmount[monthIndex] += Number(s.totalSaleAmount);
    });
    res.json({ salesAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getMonthlySalesByUser = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "Invalid userID" });
    const rows = await Sales.findAll({
      where: { userID },
      attributes: ["saleDate", "totalSaleAmount"],
    });
    const salesAmount = Array(12).fill(0);
    rows.forEach((s) => {
      const monthIndex = parseInt(String(s.saleDate).split("-")[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) salesAmount[monthIndex] += Number(s.totalSaleAmount);
    });
    res.json({ salesAmount });
  } catch (err) {
    console.error("Sales getMonthlySalesByUser:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sale = await Sales.findByPk(id);
    if (!sale || sale.userID !== parseInt(req.body.userID, 10)) return res.status(404).json({ error: "Not found" });
    await sale.update({
      productID: req.body.productID ?? sale.productID,
      storeID: req.body.storeID ?? sale.storeID,
      stockSold: req.body.stockSold ?? sale.stockSold,
      saleDate: req.body.saleDate || sale.saleDate,
      totalSaleAmount: parseFloat(req.body.totalSaleAmount) || sale.totalSaleAmount,
    });
    res.json(await Sales.findByPk(id, { include: [{ model: Product, as: "Product" }, { model: Store, as: "Store" }] }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sale = await Sales.findByPk(id);
    if (!sale) return res.status(404).json({ error: "Not found" });
    const product = await Product.findByPk(sale.productID);
    if (product) await product.update({ stock: (product.stock || 0) + (sale.stockSold || 0) });
    await sale.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addSales, getMonthlySales, getMonthlySalesByUser, getSalesData, getTotalSalesAmount, updateSale, deleteSale };
