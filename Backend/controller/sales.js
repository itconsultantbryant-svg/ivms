const { Sales, Product, Store } = require("../models");
const soldStock = require("./soldStock");

const addSales = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    const productID = parseInt(req.body.productID, 10);
    const storeID = parseInt(req.body.storeID, 10);
    const stockSold = parseInt(req.body.stockSold, 10);
    const saleDate = String(req.body.saleDate || "").trim();
    if (!userID || !productID || !storeID || !saleDate) {
      return res.status(400).json({ error: "userID, productID, storeID, and saleDate are required" });
    }
    if (!Number.isFinite(stockSold) || stockSold < 1) {
      return res.status(400).json({ error: "stockSold must be at least 1" });
    }
    const product = await Product.findByPk(productID);
    if (!product || product.userID !== userID) {
      return res.status(400).json({ error: "Invalid product for this user" });
    }
    if ((product.stock || 0) < stockSold) {
      return res.status(400).json({
        error: `Insufficient stock. Available: ${product.stock ?? 0}, requested: ${stockSold}`,
      });
    }
    const unitFromProduct = parseFloat(product.unitPrice) || 0;
    const unitPrice = parseFloat(req.body.unitPrice);
    const unit = Number.isFinite(unitPrice) ? unitPrice : unitFromProduct;
    const computedTotal = unit * stockSold;
    const totalIn = parseFloat(req.body.totalSaleAmount);
    const totalSaleAmount = Number.isFinite(totalIn) && totalIn >= 0 ? totalIn : computedTotal;

    const row = await Sales.create({
      userID,
      productID,
      storeID,
      stockSold,
      saleDate,
      totalSaleAmount: Number(Number(totalSaleAmount).toFixed(2)),
    });
    await soldStock(productID, stockSold);
    res.status(200).json(row);
  } catch (err) {
    console.error("addSales:", err.message);
    res.status(500).json({ error: err.message });
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
        { model: Product, as: "Product", attributes: ["id", "name", "manufacturer", "stock", "unitPrice", "barcode"] },
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

    const oldQty = sale.stockSold;
    const oldPid = sale.productID;
    const newPid = parseInt(req.body.productID, 10) || oldPid;
    const newQty = parseInt(req.body.stockSold, 10) || oldQty;

    if (oldPid === newPid) {
      const product = await Product.findByPk(oldPid);
      if (!product) return res.status(400).json({ error: "Product not found" });
      const available = (product.stock || 0) + oldQty;
      if (available < newQty) {
        return res.status(400).json({ error: `Insufficient stock. Available after adjusting sale: ${available}` });
      }
      await product.update({ stock: available - newQty });
    } else {
      const pOld = await Product.findByPk(oldPid);
      if (pOld) await pOld.update({ stock: (pOld.stock || 0) + oldQty });
      const pNew = await Product.findByPk(newPid);
      if (!pNew) return res.status(400).json({ error: "Product not found" });
      if ((pNew.stock || 0) < newQty) {
        return res.status(400).json({ error: "Insufficient stock for selected product" });
      }
      await pNew.update({ stock: (pNew.stock || 0) - newQty });
    }

    const newProd = await Product.findByPk(newPid);
    const unitFromProduct = parseFloat(newProd?.unitPrice) || 0;
    const unitPrice = parseFloat(req.body.unitPrice);
    const unit = Number.isFinite(unitPrice) ? unitPrice : unitFromProduct;
    const computedTotal = unit * newQty;
    const totalIn = parseFloat(req.body.totalSaleAmount);
    const totalSaleAmount = Number.isFinite(totalIn) && totalIn >= 0 ? totalIn : computedTotal;

    await sale.update({
      productID: newPid,
      storeID: parseInt(req.body.storeID, 10) || sale.storeID,
      stockSold: newQty,
      saleDate: req.body.saleDate || sale.saleDate,
      totalSaleAmount: Number(Number(totalSaleAmount).toFixed(2)),
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
