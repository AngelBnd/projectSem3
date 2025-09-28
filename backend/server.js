
require('dotenv').config(); 

const express = require("express");
// const fs = require('fs');
// const path = require('path');
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// File paths
// const INVENTORY_FILE = path.join(__dirname, "data", "inventoryItems.json");
// const SALES_FILE = path.join(__dirname, "data", "transactions.json");
// const USERS_FILE = path.join(__dirname, "data", "users.json");

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

/* -------------------- AUTHENTICATION ROUTES -------------------- */

// Register a new user
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(401).json({ error: "Username and password are required" });
  }

  try {
    const existingUser = await prisma.users.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return res.status(401).json({ error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.users.create({
      data: {
        username: username,
        password: hashedPassword,
      },

      select: { //milih mau yg mana dikirim
        id: true,
        username: true,
      }
    });

    res.status(201).json({ 
      message: "User registered successfully",
      user: newUser // Return the new user object (without the password)
    });

  } catch (error) {
    // Check if the error is a known database error (e.g., connection issue)
    console.error("Prisma registration error:", error);
    res.status(500).json({ error: "Database or server error during registration." });
  }
});

// Login a user and return a JWT
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await prisma.users.findUnique({
      where :{
        username : username
      },
    });

    if(!userExists){
       return res.status(401).json({ error: "Username is not found" });
    }

    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    // const users = JSON.parse(usersData);

    // const user = users.find(u => u.username === username);
    // if (!user) {
    //   return res.status(401).json({ error: "Invalid username or password" });
    // }

    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return res.status(401).json({ error: "Invalid username or password" });
    // }

    // Include the user's ID in the JWT payload
    const token = jwt.sign({ id: userExists.id, username: userExists.username }, JWT_SECRET, { expiresIn: '1h' });

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
    // Store the full user object (including ID) on the request
    req.user = {
      id: parseInt(user.id, 10),
    };
    next();
  });
};

/* -------------------- INVENTORY ROUTES -------------------- */

// GET all inventory items for the current user
app.get("/api/inventory", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try{
      const inventoryData = await prisma.products.findMany({
        where: {
          userId : userId
        }
      });  
      res.json(inventoryData);

  } catch(error){
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Failed to retrieve inventory data." });
  }

  // fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
  //   if (err) return res.status(500).json({ error: "Failed to read inventory file" });
  //   const inventory = JSON.parse(data);
  //   const userInventory = inventory.filter(item => item.userId === userId);
  //   res.json(userInventory);
  // });
});

// DELETE (remove an inventory item) for the current user
app.delete("/api/inventory/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

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

    // Filter to only include items that belong to the user AND don't match the ID
    const newInventory = inventory.filter(
      (item) => !(String(item.productCode) === String(id) && item.userId === userId)
    );
    
    // Check if the item was found and removed
    const itemRemoved = newInventory.length < inventory.length;
    if (!itemRemoved) {
        return res.status(404).json({ error: "Item not found or does not belong to the user" });
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


// OLD FETCH USING FS
// app.get('/api/inventory/:productCode', authenticateToken, (req, res) => {
//   const productCode = req.params.productCode;
//   const userId = req.user.id;

//   fs.readFile(INVENTORY_FILE, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error fetching inventory:', err);
//       return res.status(500).json({ error: 'Failed to read inventory file' });
//     }

//     try {
//       const inventory = JSON.parse(data);
//       // Find the product that matches both product code AND user ID
//       const product = inventory.find(item => item.productCode === productCode && item.userId === userId);

//       if (product) {
//         res.status(200).json(product);
//       } else {
//         res.status(404).json({ error: 'Product not found or does not belong to the user' });
//       }
//     } catch (parseError) {
//       console.error('Error parsing JSON data:', parseError);
//       res.status(500).json({ error: 'Error parsing inventory data' });
//     }
//   });
// });

app.get('/api/inventory/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        // userId should be guaranteed to be an integer here based on a well-written authenticateToken
        const userId = req.user.id; 

        const products = await prisma.products.findMany({
            where: {
                userId: userId,
                OR: [
                    { productCode: { contains: q } },
                    { productName: { contains: q } },
                ],
            },
            take: 10,
        });

        res.json(products);
    } catch (error) {
        console.error("Search API Error:", error);
        res.status(500).json({ error: 'Failed to search for products' });
    }
});


app.get('/api/inventory/:productCode', authenticateToken, async (req, res) => {
  try {
    const { productCode } = req.params;
    const userId = req.user.id;

    const findProduct = await prisma.products.findFirst({
      where: {
        productCode: productCode,
        userId: userId,
      },
    });

    if(findProduct) {
      res.status(200).json(findProduct);
    } else {
      res.status(404).json({ error: 'Product not found or does not belong to the user' });
    }
  } catch (error) {
    console.error('Error fetching product from database:', error);
    res.status(500).json({ error: 'Failed to retrieve product data' });
  }
});

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// POST new inventory item
app.post("/api/inventory", authenticateToken, async (req, res) => {
  const newProduct = req.body;
  const userId = req.user.id; // Get the user ID from the authenticated token

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
    if (!newProduct[field]) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }
  
  newProduct.userId = userId;
  newProduct.initialStock = parseInt(newProduct.initialStock);
  newProduct.thresholdStock  = parseInt(newProduct.thresholdStock);
  newProduct.thresholdStock  = parseInt(newProduct.thresholdStock);

  try {
    const productExists = await prisma.products.findUnique({
      where : {
        productCode : newProduct.productCode,
      },
    })

    if(productExists){
      return res.status(401).json({ error: "Product code already exists" });
    }

    const insertedProduct = await prisma.products.create({
      data : newProduct
    })

    res.status(201).json({ 
    message: "Product added successfully",
    product: {
      productCode: insertedProduct.productCode,
      name: insertedProduct.name,
      quantity: newProduct.quantity,
    }
  }); 
  }catch(error){
    console.error("Prisma inventory creation error:", error);
    res.status(500).json({ error: "Failed to add product to inventory." });
  }
});

/* -------------------- SALES/TRANSACTIONS ROUTES -------------------- */

// GET all sales for the current user
app.get("/api/sales", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const transactionsData = await prisma.invoices.findMany({
      where:{
        userId : userId
      }
    })
    res.json(transactionsData);

  }catch(error){
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to retrieve transactions data." });
  }

  // fs.readFile(SALES_FILE, "utf8", (err, data) => {
  //   if (err) return res.status(500).json({ error: "Failed to read sales file" });
  //   const sales = JSON.parse(data);
  //   const userSales = sales.filter(sale => sale.userId === userId);
  //   res.json(userSales);
  // });
});

// POST new sale
app.post("/api/sales", authenticateToken, async (req, res) => {
  const { products: productsSold, discount, invoiceDate, paymentMethod, uniqueId } = req.body;
  const userId = req.user.id;

  if(!productsSold || productsSold.length === 0) {
    return res.status(400).json({ error: "Transaction must contain at least one product "});
  }

  try {
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Creates new Record (row) to model transaction
    const newTransaction = await prisma.$transaction(async (tx) => {
      let invoiceSubtotal = 0;
      let totalAmount = 0;
      const LineItemsCreate = [];

      // Go through each product
      for(const p of productsSold) {

        // Check if it exists
        const inventoryItem = await tx.products.findUnique({ where: { productCode : p.productCode }});
        if(!inventoryItem) throw new Error(`Product with ID ${p.productId} not found`);

        // Check if it has enough stock
        try {
          await tx.products.update({
            where: { productCode: p.productCode, initialStock: { gte: p.quantitySold} },
            data: { initialStock: { decrement: p.quantitySold } },
          });
        } catch (error) {
          throw new Error(`Not enough stock : ${inventoryItem.initialStock}`);
        }

        // Calculate subtotal (selling price with amount sold)
        const lineSubtotal = inventoryItem.sellingPrice * p.quantitySold;

        // The full total Amount for transaction
        invoiceSubtotal += lineSubtotal;

        // Push the entry of records to data
        LineItemsCreate.push({
          invoiceId: uniqueId,
          productCode: p.productCode,
          quantitySold: p.quantitySold,
          sellingPrice: inventoryItem.sellingPrice,
          lineSubtotal: lineSubtotal
        });
      }

      // Update amount with discount
      totalAmount = invoiceSubtotal - (invoiceSubtotal * (discount / 100));

      const createdTransaction = await tx.invoices.create({
        data: {
          invoiceId: uniqueId,
          invoiceDate: new Date(invoiceDate),
          discountPrice: discount,
          invoiceSubtotal: invoiceSubtotal,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          userId: userIdInt,
          lineItems: {
            create: LineItemsCreate, // Create and connect all line items
          },
        },
        include: {
          lineItems: true, // Include the newly created line items in the response
        },
      });

      return createdTransaction;
    });

    res.status(201).json({ success: true, invoice: newTransaction });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.put("/api/sales/:invoiceId", authenticateToken, (req, res) => {
  const invoiceIdToUpdate = req.params.invoiceId;
  const updatedSaleData = req.body;
  const userId = req.user.id;

  fs.readFile(SALES_FILE, "utf8", (err, salesData) => {
    if (err) {
      console.error("Failed to read sales file:", err);
      return res.status(500).json({ error: "Failed to read sales data" });
    }

    let sales = JSON.parse(salesData);
    const saleIndex = sales.findIndex(sale => sale.invoiceId === invoiceIdToUpdate && sale.userId === userId);

    if (saleIndex === -1) {
      return res.status(404).json({ error: "Sale not found or does not belong to the user" });
    }
    
    // Recalculate financial values (subtotal and totalAmount) - this logic should ideally be on the server.
    const finalUpdatedSale = {
      ...sales[saleIndex],
      ...updatedSaleData,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
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
// This route appears to be a duplicate of /api/inventory, so it's adjusted to be redundant.
app.get("/inventory", authenticateToken, (req, res) => {
  const userId = req.user.id;
  fs.readFile(INVENTORY_FILE, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data file" });
    }
    const inventory = JSON.parse(data);
    const userInventory = inventory.filter(item => item.userId === userId);
    res.json(userInventory);
  });
});

app.put('/api/inventory/:id', authenticateToken, (req, res) => {
  const selectedProductCode = req.params.id;
  const editedItem = req.body;
  const userId = req.user.id;

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

    // Find the product that matches both the product code AND the user ID
    const productIndex = inventory.findIndex(item => item.productCode === selectedProductCode && item.userId === userId);

    if (productIndex !== -1) {
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
      res.status(404).send('Item not found or does not belong to the user.');
    }
  });
});

// DELETE (remove a transaction item)
app.delete("/api/sales/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

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

    // Filter to only include sales that belong to the user AND don't match the ID
    const newSales = sales.filter((sale) => !(String(sale.invoiceId) === String(id) && sale.userId === userId));

    const itemRemoved = newSales.length < sales.length;
    if (!itemRemoved) {
      return res.status(404).json({ error: "Sale not found or does not belong to the user" });
    }

    fs.writeFile(SALES_FILE, JSON.stringify(newSales, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Failed to write sales file:", writeErr);
        return res.status(500).json({ error: "Failed to save sales file" });
      }
      res.json({ success: true, message: "Sale deleted successfully." });
    });
  });
});

/* -------------------- DATA TRANSACTIONS STUFF -------------------- */
// This route is a duplicate of /api/sales and is adjusted to be redundant.
app.get("/transactions", authenticateToken, (req, res) => {
  const userId = req.user.id;
  fs.readFile(SALES_FILE, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data file" });
    }
    const sales = JSON.parse(data);
    const userSales = sales.filter(sale => sale.userId === userId);
    res.json(userSales);
  });
});


/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});