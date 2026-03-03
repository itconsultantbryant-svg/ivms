const { CompanyProfile } = require("../models");

const getOrCreate = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID, 10);
    if (!userID) return res.status(400).json({ error: "userID required" });
    let row = await CompanyProfile.findOne({ where: { userID } });
    if (!row) {
      row = await CompanyProfile.create({
        userID,
        companyName: "Inventory",
        currencyCode: "USD",
        currencySymbol: "$",
        prefixCategory: "CA",
        prefixItem: "IT",
        prefixSupplier: "SU",
        prefixPurchase: "PC",
        prefixCustomer: "CU",
        prefixSales: "SA",
        prefixExpenses: "EX",
      });
    }
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    console.error("CompanyProfile getOrCreate:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userID = parseInt(req.body.userID, 10);
    if (!userID) return res.status(400).json({ error: "userID required" });
    let row = await CompanyProfile.findOne({ where: { userID } });
    if (!row) {
      row = await CompanyProfile.create({
        userID,
        companyName: req.body.companyName ?? "",
        tagLine: req.body.tagLine ?? "",
        businessType: req.body.businessType ?? "",
        ownerName: req.body.ownerName ?? "",
        mobileNo: req.body.mobileNo ?? "",
        phoneNo: req.body.phoneNo ?? "",
        faxNo: req.body.faxNo ?? "",
        email: req.body.email ?? "",
        taxNumber: req.body.taxNumber ?? "",
        address: req.body.address ?? "",
        timeZone: req.body.timeZone ?? "",
        currencyCode: req.body.currencyCode ?? "USD",
        currencySymbol: req.body.currencySymbol ?? "$",
        prefixCategory: req.body.prefixCategory ?? "CA",
        prefixItem: req.body.prefixItem ?? "IT",
        prefixSupplier: req.body.prefixSupplier ?? "SU",
        prefixPurchase: req.body.prefixPurchase ?? "PC",
        prefixCustomer: req.body.prefixCustomer ?? "CU",
        prefixSales: req.body.prefixSales ?? "SA",
        prefixExpenses: req.body.prefixExpenses ?? "EX",
      });
    } else {
      await row.update({
        companyName: req.body.companyName !== undefined ? req.body.companyName : row.companyName,
        tagLine: req.body.tagLine !== undefined ? req.body.tagLine : row.tagLine,
        businessType: req.body.businessType !== undefined ? req.body.businessType : row.businessType,
        ownerName: req.body.ownerName !== undefined ? req.body.ownerName : row.ownerName,
        mobileNo: req.body.mobileNo !== undefined ? req.body.mobileNo : row.mobileNo,
        phoneNo: req.body.phoneNo !== undefined ? req.body.phoneNo : row.phoneNo,
        faxNo: req.body.faxNo !== undefined ? req.body.faxNo : row.faxNo,
        email: req.body.email !== undefined ? req.body.email : row.email,
        taxNumber: req.body.taxNumber !== undefined ? req.body.taxNumber : row.taxNumber,
        address: req.body.address !== undefined ? req.body.address : row.address,
        timeZone: req.body.timeZone !== undefined ? req.body.timeZone : row.timeZone,
        currencyCode: req.body.currencyCode !== undefined ? req.body.currencyCode : row.currencyCode,
        currencySymbol: req.body.currencySymbol !== undefined ? req.body.currencySymbol : row.currencySymbol,
        prefixCategory: req.body.prefixCategory !== undefined ? req.body.prefixCategory : row.prefixCategory,
        prefixItem: req.body.prefixItem !== undefined ? req.body.prefixItem : row.prefixItem,
        prefixSupplier: req.body.prefixSupplier !== undefined ? req.body.prefixSupplier : row.prefixSupplier,
        prefixPurchase: req.body.prefixPurchase !== undefined ? req.body.prefixPurchase : row.prefixPurchase,
        prefixCustomer: req.body.prefixCustomer !== undefined ? req.body.prefixCustomer : row.prefixCustomer,
        prefixSales: req.body.prefixSales !== undefined ? req.body.prefixSales : row.prefixSales,
        prefixExpenses: req.body.prefixExpenses !== undefined ? req.body.prefixExpenses : row.prefixExpenses,
      });
    }
    res.json({ ...row.get({ plain: true }), _id: row.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getOrCreate, updateProfile };
