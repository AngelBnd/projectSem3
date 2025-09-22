// server.js
const express = require("express");
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
const PORT = 3000;

// import data

// File paths
const INVENTORY_FILE = path.join(__dirname, "data", "inventoryItems.json");
const SALES_FILE = path.join(__dirname, "data", "transactions.json");
const USERS_FILE = path.join(__dirname, "data", "users.json");

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_super_secret_jwt_key';

/* -------------------- AUTHENTICATION ROUTES -------------------- */

// Register a new user
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      username,
      password: hashedPassword,
    };
    users.push(newUser);

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login a user and return a JWT
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Create a JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------- Middleware to protect routes -------------------- */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: "Authentication token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

/* -------------------- INVENTORY ROUTES -------------------- */

// GET all inventory items
app.get("/api/inventory", authenticateToken, (req, res) => {
  fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read inventory file" });
    res.json(JSON.parse(data));
  });
});

// DELETE (remove an inventory item)
app.delete("/api/inventory/:id", authenticateToken, (req, res) => {
  const id = req.params.id;

  fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read inventory file:", err);
      return res.status(500).json({ error: "Failed to read inventory file" });
    }

    let inventory = [];
    try {
      inventory = JSON.parse(data || "[]");
    } catch (parseErr) {
      console.error("Failed to parse inventory JSON:", parseErr);
      return res.status(500).json({ error: "Invalid inventory data" });
    }

    const newInventory = inventory.filter((item) => String(item.productCode) !== String(id));

    if (newInventory.length === inventory.length) {
      // nothing removed
      return res.status(404).json({ error: "Item not found" });
    }

    fs.writeFile(INVENTORY_FILE, JSON.stringify(newInventory, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Failed to write inventory file:", writeErr);
        return res.status(500).json({ error: "Failed to save inventory file" });
      }
      res.json({ success: true });
    });
  });
});

app.get('/api/inventory/:productCode', authenticateToken, (req, res) => {
  const productCode = req.params.productCode;

  // Use the callback version of fs.readFile
  fs.readFile(INVENTORY_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      // It's good practice to send a 500 status on a server-side error
      return res.status(500).json({ error: 'Failed to read inventory file' });
    }

    try {
      const inventory = JSON.parse(data);
      const product = inventory.find(item => item.productCode === productCode);

      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      res.status(500).json({ error: 'Error parsing inventory data' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// POST new inventory item
app.post("/api/inventory", authenticateToken, (req, res) => {
  const newItem = req.body;

  const required = [
    "productCode",
    "productName",
    "productBrand",
    "productCategory",
    "unitCost",
    "sellingPrice",
    "initialStock",
    "thresholdStock",
  ];
  for (let field of required) {
    if (!newItem[field]) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  // First, read the file
  fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
    if (err) {
      console.error('Error reading inventory file:', err);
      return res.status(500).json({ error: "Failed to read inventory file" });
    }

    try {
      const inventory = JSON.parse(data);
      newItem.lastUpdated = new Date().toISOString().split('T')[0];
      inventory.push(newItem);

      // Then, write the updated inventory back to the file
      fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2), (err) => {
        if (err) {
          console.error('Error writing to inventory file:', err);
          return res.status(500).json({ error: "Failed to save item" });
        }
        
        // Only send the success response AFTER the file has been successfully written
        res.json({ success: true, item: newItem });
      });
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      return res.status(500).json({ error: "Corrupted inventory data" });
    }
  });
});

/* -------------------- SALES/TRANSACTIONS ROUTES -------------------- */

// GET all sales
app.get("/api/sales", authenticateToken, (req, res) => {
  fs.readFile(SALES_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read sales file" });
    res.json(JSON.parse(data));
  });
});

// POST new sale
app.post("/api/sales", authenticateToken, (req, res) => {
  const newSale = req.body;

  const required = ["productCode", "invoiceDate", "quantitySold", "discount", "tax"];
  for (let field of required) {
    if (!newSale[field]) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  // Generate a unique invoice ID.
  // This approach uses the current timestamp and a random number for uniqueness.
  const uniqueId = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  newSale.invoiceId = uniqueId;

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
    const subtotal = (unitPrice * quantity).toFixed(2);
    const discounted = subtotal - (subtotal * (newSale.discount / 100));
    const totalAmount = (discounted + (discounted * (newSale.tax / 100))).toFixed(2);

    newSale.unitCost = parseFloat(product.unitCost); // optional
    newSale.sellingPrice = unitPrice;
    newSale.subtotal = subtotal;
    newSale.totalAmount = totalAmount;

    // 3️⃣ Save to sales file
    fs.readFile(SALES_FILE, "utf8", (err, salesData) => {
      if (err) return res.status(500).json({ error: "Failed to read sales file" });

      const sales = JSON.parse(salesData);
      newSale.lastUpdated = new Date().toISOString().split('T')[0];
      sales.push(newSale);

      fs.writeFile(SALES_FILE, JSON.stringify(sales, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Failed to save sale" });
        res.json({ success: true, sale: newSale });
      });
    });
  });
});

app.put("/api/sales/:invoiceId", authenticateToken, (req, res) => {
  const invoiceIdToUpdate = req.params.invoiceId;
  const updatedSaleData = req.body;

  fs.readFile(SALES_FILE, "utf8", (err, salesData) => {
    if (err) {
      console.error("Failed to read sales file:", err);
      return res.status(500).json({ error: "Failed to read sales data" });
    }

    let sales = JSON.parse(salesData);
    const saleIndex = sales.findIndex(sale => sale.invoiceId === invoiceIdToUpdate);

    if (saleIndex === -1) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // Preserve the original invoiceId and other non-editable fields
    const existingSale = sales[saleIndex];
    const finalUpdatedSale = {
      ...existingSale,
      ...updatedSaleData,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    // Recalculate financial values (subtotal and totalAmount)
    const unitPrice = parseFloat(existingSale.sellingPrice);
    const quantity = parseFloat(finalUpdatedSale.quantitySold);
    const subtotal = unitPrice * quantity;
    const discounted = subtotal - (subtotal * (parseFloat(finalUpdatedSale.discount) / 100));
    const totalAmount = discounted + (discounted * (parseFloat(finalUpdatedSale.tax) / 100));

    finalUpdatedSale.subtotal = parseFloat(subtotal.toFixed(2));
    finalUpdatedSale.totalAmount = parseFloat(totalAmount.toFixed(2));

    // Update the sales array
    sales[saleIndex] = finalUpdatedSale;

    fs.writeFile(SALES_FILE, JSON.stringify(sales, null, 2), (err) => {
      if (err) {
        console.error("Failed to write sales file:", err);
        return res.status(500).json({ error: "Failed to update sale" });
      }

      res.status(200).json({ success: true, updatedSale: finalUpdatedSale });
    });
  });
});

/* -------------------- DATA INVENTORY STUFF -------------------- */

app.get("/inventory", authenticateToken, (req, res) => {
  fs.readFile(INVENTORY_FILE, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data file" });
    }
    res.json(JSON.parse(data));
  });
});

app.put('/api/inventory/:id', authenticateToken, (req, res) => {
  const selectedProductCode = req.params.id;
  const editedItem = req.body;

  fs.readFile(INVENTORY_FILE, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read data file' });
    }

    let inventory = [];
    try {
      inventory = JSON.parse(data);
    } catch (parseErr) {
      console.error(parseErr);
      return res.status(500).json({ error: 'Failed to parse JSON data' });
    }

    const productIndex = inventory.findIndex(item => item.productCode === selectedProductCode);

    if (productIndex !== -1) {
      // Create an updated item object.
      // We set the lastUpdated date on the server.
      const updatedItem = {
        ...inventory[productIndex],
        ...editedItem,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      inventory[productIndex] = updatedItem;

      fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2), (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          return res.status(500).json({ error: 'Failed to save item' });
        }
        res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
      });
    } else {
      res.status(404).send('Item not found.');
    }
  });
});

// DELETE (remove an inventory item)
app.delete("/api/inventory/:id", authenticateToken, (req, res) => {
  const id = req.params.id;

  fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read inventory file:", err);
      return res.status(500).json({ error: "Failed to read inventory file" });
    }

    let inventory = [];
    try {
      inventory = JSON.parse(data || "[]");
    } catch (parseErr) {
      console.error("Failed to parse inventory JSON:", parseErr);
      return res.status(500).json({ error: "Invalid inventory data" });
    }

    const newInventory = inventory.filter((item) => String(item.productCode) !== String(id));

    if (newInventory.length === inventory.length) {
      // nothing removed
      return res.status(404).json({ error: "Item not found" });
    }

    fs.writeFile(INVENTORY_FILE, JSON.stringify(newInventory, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Failed to write inventory file:", writeErr);
        return res.status(500).json({ error: "Failed to save inventory file" });
      }
      res.json({ success: true });
    });
  });
});

// DELETE (remove a transaction item)
app.delete("/api/sales/:id", authenticateToken, (req, res) => {
  const id = req.params.id;

  fs.readFile(SALES_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read sales file:", err);
      return res.status(500).json({ error: "Failed to read sales file" });
    }

    let sales = [];
    try {
      sales = JSON.parse(data || "[]");
    } catch (parseErr) {
      console.error("Failed to parse sales JSON:", parseErr);
      return res.status(500).json({ error: "Invalid sales data" });
    }

    console.log("ID received from frontend:", id); // Log the ID from the URL
    console.log("Invoice IDs in the sales data:", sales.map(s => s.invoiceId)); // Log all invoice IDs

    // Filter out the transaction with the matching invoiceId
    const newSales = sales.filter((sale) => String(sale.invoiceId) !== String(id));

    console.log("Number of sales before filter:", sales.length);
    console.log("Number of sales after filter:", newSales.length);

    if (newSales.length === sales.length) {
      // nothing removed
      return res.status(404).json({ error: "Sale not found" });
    }

    fs.writeFile(SALES_FILE, JSON.stringify(newSales, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Failed to write sales file:", writeErr);
        return res.status(500).json({ error: "Failed to save sales file" });
      }
      // Send a success response
      res.json({ success: true, message: "Sale deleted successfully." });
    });
  });
});

/* -------------------- DATA TRANSACTIONS STUFF -------------------- */

app.get("/transactions", authenticateToken, (req, res) => {
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