const { Product } = require("../models");

const purchaseStock = async (productID, quantity) => {
  try {
    const product = await Product.findByPk(productID);
    if (!product) return;
    const newStock = (product.stock || 0) + quantity;
    await product.update({ stock: newStock });
  } catch (err) {
    console.error("Error updating purchase stock", err);
  }
};

module.exports = purchaseStock;
