const express = require("express");
const router = express.Router();
const unit = require("../controller/unit");

router.post("/add", unit.addUnit);
router.get("/get/:userID", unit.getAllUnits);
router.put("/:id", unit.updateUnit);
router.delete("/:id", unit.deleteUnit);

module.exports = router;
