const { Product } = require("../models");

const soldStock = async (productID, quantity) => {
  try {
    const product = await Product.findByPk(productID);
    if (!product) return;
    const newStock = Math.max(0, (product.stock || 0) - quantity);
    await product.update({ stock: newStock });
  } catch (err) {
    console.error("Error updating sold stock", err);
  }
};

module.exports = soldStock;
