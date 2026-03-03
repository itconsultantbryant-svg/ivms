const express = require("express");
const router = express.Router();
const category = require("../controller/category");

router.post("/add", category.add);
router.get("/get/:userID", category.getAll);
router.put("/:id", category.update);
router.delete("/:id", category.remove);

module.exports = router;
