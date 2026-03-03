const express = require("express");
const router = express.Router();
const wastage = require("../controller/wastage");

router.post("/add", wastage.add);
router.get("/get/:userID", wastage.getAll);
router.put("/:id", wastage.update);
router.delete("/:id", wastage.remove);

module.exports = router;
