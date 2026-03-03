const express = require("express");
const router = express.Router();
const tax = require("../controller/tax");

router.post("/add", tax.addTax);
router.get("/get/:userID", tax.getAllTaxes);
router.put("/:id", tax.updateTax);
router.delete("/:id", tax.deleteTax);

module.exports = router;
