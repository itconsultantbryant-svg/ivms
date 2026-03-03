const express = require("express");
const app = express();
const store = require("../controller/store");

// Add Store 
app.post("/add", store.addStore);

// Get All Store
app.get("/get/:userID", store.getAllStores);
app.put("/:id", store.updateStore);
app.delete("/:id", store.deleteStore);

module.exports = app;
