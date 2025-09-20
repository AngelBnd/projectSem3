// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");


const app = express();
const PORT = 3000;

// import data

// File paths
const INVENTORY_FILE = path.resolve(__dirname, "data/inventoryItems.json");
const SALES_FILE = path.resolve(__dirname, "data/transactions.json");

// Middleware
app.use(cors());
app.use(express.json());

// Ensure files exist
if (!fs.existsSync(INVENTORY_FILE)) {
  fs.writeFileSync(INVENTORY_FILE, "[]");
}
if (!fs.existsSync(SALES_FILE)) {
  fs.writeFileSync(SALES_FILE, "[]");
}

/* -------------------- INVENTORY ROUTES -------------------- */

// GET all inventory items
app.get("/api/inventory", (req, res) => {
  fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read inventory file" });
    res.json(JSON.parse(data));
  });
});

// Search specific item in inventory
app.get("/search", (req, res) => {
  const query = req.query.q?.toLowerCase() || "";
  const results = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(query)
    )
  );
  res.json(results);
});

// POST new inventory item
app.post("/api/inventory", (req, res) => {
  const newItem = req.body;

  const required = [
    "productCode",
    "productName",
    "productBrand",
    "productCategory",
    "unitCost",
    "sellingPrice",
    "initialStock",
    "thresholdStock"
  ];
  for (let field of required) {
    if (!newItem[field]) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read inventory file" });

    const inventory = JSON.parse(data);
    inventory.push(newItem);

    fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save item" });
      res.json({ success: true, item: newItem });
    });
  });
});

/* -------------------- SALES/TRANSACTIONS ROUTES -------------------- */

// GET all sales
app.get("/api/sales", (req, res) => {
  fs.readFile(SALES_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read sales file" });
    res.json(JSON.parse(data));
  });
});

// POST new sale
app.post("/api/sales", (req, res) => {
  const newSale = req.body;

  const required = ["productCode", "date", "quantitySold", "discount","tax"];
  for (let field of required) {
    if (!newSale[field]) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  // CALCULATIONS FOR SUBTOTAL, TOTALAMOUNT
  fs.readFile(INVENTORY_FILE, "utf8", (err, inventoryData) => {
    if (err) return res.status(500).json({ error: "Failed to read inventory file" });

    const inventory = JSON.parse(inventoryData);

    // Find the product in inventory
    const product = inventory.find(
      (item) => item.productCode === newSale.productCode
    );

    if (!product) {
      return res.status(400).json({ error: "Product not found in inventory" });
    }

    // 2️⃣ Calculations using product data
    const unitPrice = parseFloat(product.sellingPrice); // Use selling price
    const quantity = parseInt(newSale.quantitySold, 10);
    const subtotal = unitPrice * quantity;
    const discounted = subtotal - (subtotal * (newSale.discount / 100));
    const totalAmount = discounted + (discounted * (newSale.tax / 100));

    newSale.unitCost = parseFloat(product.unitCost); // optional
    newSale.sellingPrice = unitPrice;
    newSale.subtotal = subtotal;
    newSale.totalAmount = totalAmount;

    // 3️⃣ Save to sales file
    fs.readFile(SALES_FILE, "utf8", (err, salesData) => {
      if (err) return res.status(500).json({ error: "Failed to read sales file" });

      const sales = JSON.parse(salesData);
      sales.push(newSale);

      fs.writeFile(SALES_FILE, JSON.stringify(sales, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Failed to save sale" });
        res.json({ success: true, sale: newSale });
      });
    });
  });

});

/* -------------------- DATA INVENTORY STUFF -------------------- */

app.get("/inventory", (req, res) => {
  fs.readFile(INVENTORY_FILE, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data file" });
    }
    res.json(JSON.parse(data));
  });
});


/* -------------------- DATA TRANSACTIONS STUFF -------------------- */

app.get("/transactions", (req, res) => {
  fs.readFile(SALES_FILE, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data file" });
    }
    res.json(JSON.parse(data));
  });
});


/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
/* -------------------- GOOD LUCK GUYS :D -------------------- */