const express = require("express");
const router = express.Router();
const companyProfile = require("../controller/companyProfile");

router.get("/get/:userID", companyProfile.getOrCreate);
router.put("/update", companyProfile.updateProfile);

module.exports = router;
