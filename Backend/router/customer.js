const express = require("express");
const router = express.Router();
const customer = require("../controller/customer");

router.post("/add", customer.add);
router.get("/get/:userID", customer.getAll);
router.put("/:id", customer.update);
router.delete("/:id", customer.remove);

module.exports = router;
