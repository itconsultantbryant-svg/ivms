const express = require("express");
const router = express.Router();
const supplier = require("../controller/supplier");

router.post("/add", supplier.add);
router.get("/get/:userID", supplier.getAll);
router.put("/:id", supplier.update);
router.delete("/:id", supplier.remove);

module.exports = router;
