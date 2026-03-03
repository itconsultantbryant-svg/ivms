const express = require("express");
const app = express();
const sales = require("../controller/sales");

// Add Sales
app.post("/add", sales.addSales);

// Get All Sales
app.get("/get/:userID", sales.getSalesData);
app.get("/getmonthly", sales.getMonthlySales);
app.get("/get/:userID/monthly", sales.getMonthlySalesByUser);
app.get("/get/:userID/totalsaleamount", sales.getTotalSalesAmount);
app.put("/:id", sales.updateSale);
app.delete("/:id", sales.deleteSale);

module.exports = app;



// http://localhost:4000/api/sales/add POST
// http://localhost:4000/api/sales/get GET
