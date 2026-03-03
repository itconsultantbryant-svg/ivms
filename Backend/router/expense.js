const express = require("express");
const router = express.Router();
const expense = require("../controller/expense");

router.post("/add", expense.add);
router.get("/get/:userID", expense.getAll);
router.put("/:id", expense.update);
router.delete("/:id", expense.remove);

module.exports = router;
