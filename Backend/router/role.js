const express = require("express");
const router = express.Router();
const role = require("../controller/role");

router.post("/add", role.add);
router.get("/get/:userID", role.getAll);
router.put("/:id", role.update);
router.delete("/:id", role.remove);
router.get("/:roleID/permissions", role.getPermissions);
router.put("/:roleID/permissions", role.setPermissions);

module.exports = router;
