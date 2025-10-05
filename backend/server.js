require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

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

app.get('/api/sales/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user.id; 

        const sales = await prisma.invoices.findMany({
            where: {
                userId: userId,
                OR: [
                    { invoiceId: { contains: q } },
                    { name: { contains: q } },
                ],
            },
            take: 10,
        });

        res.json(sales);
    } catch (error) {
        console.error("Search API Error:", error);
        res.status(500).json({ error: 'Failed to search for sales' });
    }
});


// app.get('/api/inventory/:productCode', authenticateToken, async (req, res) => {
//   try {
//     const { productCode } = req.params;
//     const userId = req.user.id;

//     const findProduct = await prisma.products.findFirst({
//       where: {
//         productCode: productCode,
//         userId: userId,
//       },
//     });

//     if(findProduct) {
//       res.status(200).json(findProduct);
//     } else {
//       res.status(404).json({ error: 'Product not found or does not belong to the user' });
//     }
//   } catch (error) {
//     console.error('Error fetching product from database:', error);
//     res.status(500).json({ error: 'Failed to retrieve product data' });
//   }
// });

// GET all inventory items for the current user
app.get("/api/inventory", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { category } = req.query;

  const whereClaus = {
    userId: userId
  };

  if(category && category !== 'All') {
    whereClaus.productCategory = category;
  }

  try{
      const inventoryData = await prisma.products.findMany({
        where: whereClaus,
        orderBy: {
          lastUpdated: "asc"
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

app.get("/api/inventory/categories", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const categories = await prisma.products.findMany({
      where: {
        userId: userId,
        productCategory: {
          not: null,
          not: ''
        }
      },
      distinct: ['productCategory'],
      select: {
        productCategory: true
      },
      orderBy: {
        productCategory: 'asc'
      }
    });

    const categoryList = categories.map(c => c.productCategory);

    res.json(categoryList);
  } catch (error) {
    console.error("Error fetching distinct categories: ", error);
    res.status(500).json({error: "Failed to retrieve product categories"});
  }
});

// GET single inventory item by product code (Read One)
app.get('/api/inventory/:productCode', authenticateToken, async (req, res) => {
  const productCode = req.params.productCode;
  const userId = req.user.id;

  try {
    const product = await prisma.products.findUnique({
      where: {
        productCode: productCode,
        userId: userId, // Ensure the user owns the product
      },
    });

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found or does not belong to the user' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// DELETE (remove an inventory item) for the current user
app.delete("/api/inventory/:id", authenticateToken, async (req, res) => {
  const productCode = req.params.id;
  const userId = req.user.id;

  try {
    await prisma.products.delete({
      where: {
        // Crucial security check: only allow deletion if the user owns the product
        productCode: productCode,
        userId: userId, 
      },
    });
    res.json({ success: true, message: "Item deleted successfully." });

  } catch (error) {
    // P2025 means the record was not found (or not found for the given userId)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Item not found or does not belong to the user." });
    }
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item from database." });
  }
});



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

// PUT (Update)
app.put('/api/inventory/:id', authenticateToken, async (req, res) => {
  const productCode = req.params.id;
  const editedItem = req.body;
  const userId = req.user.id;

  try {
    const updatedItem = await prisma.products.update({
      where: {
        productCode: productCode,
        userId: userId,
      },
      data: {
        productName: editedItem.productName,
        productBrand: editedItem.productBrand,
        productCategory: editedItem.productCategory,
        unitCost: parseFloat(editedItem.unitCost),
        sellingPrice: parseFloat(editedItem.sellingPrice),
        initialStock: {
          increment : editedItem.stockToAdd
        },
        thresholdStock: parseInt(editedItem.thresholdStock, 10),
      },
    });
    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });

  } catch (error) {
    // P2025 is the error code for "Record to update not found."
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Item not found or does not belong to the user." });
    }
    console.error("Error updating item:", error);
    res.status(500).json({ error: 'Failed to update item in database.' });
  }
});

/* -------------------- SALES/TRANSACTIONS ROUTES -------------------- */

// GET all sales for the current user
app.get("/api/sales", authenticateToken, async (req, res) => {
  try {
    const { period, category, search } = req.query;

    const whereClause = {
      userId: req.user.id,
    };

    const lineItemConditions = [];

    let startDate, endDate;
    const now = new Date();

    if (period && period.startsWith('last_') && period.endsWith('_days')) {
        const parts = period.split('_'); 
        const days = parseInt(parts[1], 10);

        if (!isNaN(days) && days > 0) {
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);

            startDate = new Date(now);
            startDate.setDate(now.getDate() - (days - 1));
            startDate.setHours(0, 0, 0, 0);
        }
    } else {
    switch (period) {
        case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
    }
  }

    if (startDate && endDate) {
      whereClause.invoiceDate = {
        gte: startDate,
        lte: endDate,
      };
    }
    
    if (category) {
      lineItemConditions.push({
        product: {
          productCategory: {
            equals: category,
          },
        },
      });
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
        {
          lineItems: {
            some: {
              product: {
                OR: [
                  { productName: { contains: search } },
                  { productCode: { contains: search } },
                ],
              },
            },
          },
        },
      ];
    }


    if (lineItemConditions.length > 0) {
      whereClause.lineItems = {
        some: {
          AND: lineItemConditions,
        },
      };
    }

    const filteredInvoices = await prisma.invoices.findMany({
      where: whereClause, 
      include: {
        lineItems: {
          include: {
            product: true 
          }
        }
      },
      orderBy: {
        invoiceDate: 'desc'
      }
    });
    
    res.json(filteredInvoices);

  } catch (error) {
    console.error("Error fetching invoices:", error); // Log the actual error
    res.status(500).json({ error: "Failed to fetch invoices." });
  }
});

app.get("/api/sales/categories", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const categories = await prisma.products.findMany({
      where: {
        userId: userId,
        productCategory: {
          not: null,
          not: ''
        }
      },
      distinct: ['productCategory'],
      select: {
        productCategory: true
      },
      orderBy: {
        productCategory: 'asc'
      }
    });

    const categoryList = categories.map(c => c.productCategory);

    res.json(categoryList);
  } catch (error) {
    console.error("Error fetching distinct categories: ", error);
    res.status(500).json({error: "Failed to retrieve product categories"});
  }
});

app.delete("/api/sales/:invoiceId", authenticateToken, async (req, res) => {
  const invoiceId = req.params.invoiceId;
  const userId = req.user.id;

  try {

    const invoiceToDelete = await prisma.invoices.findUnique({
      where: {
        invoiceId: invoiceId,
        userId: userId
      },
      include: {
        lineItems: true
      },
    });

    if(!invoiceToDelete) {
      return res.status(404).json({ error: "Invoice not found or does not belong to user" });
    }

    await prisma.$transaction(async (tx) => {
      const restockProducts = [];

      for(const item of invoiceToDelete.lineItems) {
        restockProducts.push(
          tx.products.update({
            where: {productCode: item.productCode, userId: item.userId},
            data: {
              initialStock: {increment: item.quantitySold},
            },
          })
        );
      }

      await Promise.all(restockProducts);

      await tx.lineItems.deleteMany({
        where: {invoiceId: invoiceId},
      });

      await tx.invoices.delete({
        where: {invoiceId: invoiceId, userId: userId}
      });

    });
    res.json({ success: true, message: "Invoice deleted successfully"});
  } catch (error) {
    if(error.code === 'P2025') {
      return res.status(404).json({ error: "Invoice not found or does not belong to user" });
    }
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete invoice from database" });
  }
});

// app.get('/api/sales/search', authenticateToken, async (req, res) => {
//     try {
//         const { q } = req.query;
//         const userId = req.user.id; 

//         const invoices = await prisma.invoices.findMany({
//             where: {
//                 userId: userId,

//                 OR: [
//                     { name: { contains: q } },
//                     { subject: { contains: q } },

//                     {
//                       lineItems: {
//                         some: {
//                           productCode: {
//                             contains : q,
//                           },
//                         },
//                       },
//                     },

//                     {
//                       lineItems: {
//                         some: {
//                             product: { 
//                                 productName: { contains: q },
//                             },
//                         },
//                       },
//                     },
//                 ],
//             },

//             include: {
//               lineItems: true,
//             },
//             take: 10,
//         });

//         res.json(invoices);
//     } catch (error) {
//         console.error("Search API Error:", error);
//         res.status(500).json({ error: 'Failed to search for products' });
//     }
// });

// POST new sale
app.post("/api/sales", authenticateToken, async (req, res) => {
  const { products: productsSold, discount, invoiceDate, paymentMethod, invoiceId, subject, name } = req.body;
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

        const inventoryItem = await tx.products.findUnique({ where: { productCode : p.productCode }});
        if(!inventoryItem) throw new Error(`Product with ID ${p.productCode} not found`);

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
          quantitySold: p.quantitySold,
          sellingPrice: inventoryItem.sellingPrice,
          lineSubtotal: lineSubtotal,
          product: {
            connect: {productCode: p.productCode}
          }
        });
      }

      // Update amount with discount
      totalAmount = invoiceSubtotal - (invoiceSubtotal * (discount / 100));

      const createdTransaction = await tx.invoices.create({
        data: {
          invoiceId: invoiceId,
          subject, subject,
          name: name,
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


app.put("/api/sales/:invoiceId", authenticateToken, async (req, res) => {
    const invoiceIdToUpdate = req.params.invoiceId;
    const updatedSaleData = req.body;
    const userId = req.user.id;
    const lineItemsArray = req.body.products; 

    const calculatedLineItems = lineItemsArray.map(product => {
        const price = parseFloat(product.sellingPrice) || 0;
        const qty = parseInt(product.quantitySold, 10) || 0;
        const subtotal = price * qty;
        
        return {
            productCode: product.productCode,
            quantitySold: qty,  
            sellingPrice: price, 
            lineSubtotal: subtotal,
        };
    });

    const rawSubtotal = calculatedLineItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
    const discount = parseFloat(updatedSaleData.discountPrice) || 0; 
    const finalTotal = rawSubtotal - discount;


    try {
        const oldInvoice = await prisma.invoices.findUnique({
            where: { invoiceId: invoiceIdToUpdate },
            include: {
                lineItems: true,
            },
        });

        if (!oldInvoice || oldInvoice.userId !== userId) {
            return res.status(404).json({ error: "Invoice not found or does not belong to the user." });
        }

        const oldLineItems = oldInvoice.lineItems;

        const stockUpdates = [];
        
        const oldQuantities = oldLineItems.reduce((acc, item) => {
            acc[item.productCode] = item.quantitySold;
            return acc;
        }, {});
        
        const newQuantities = calculatedLineItems.reduce((acc, item) => {
            acc[item.productCode] = item.quantitySold;
            return acc;
        }, {});

        const allProductCodes = new Set([
            ...Object.keys(oldQuantities),
            ...Object.keys(newQuantities),
        ]);

        for (const productCode of allProductCodes) {
            const oldQty = oldQuantities[productCode] || 0;
            const newQty = newQuantities[productCode] || 0;
            
            const stockAdjustment = oldQty - newQty; 

            if (stockAdjustment !== 0) {
                stockUpdates.push({
                    productCode,
                    stockAdjustment,
                });
            }
        }
        
        const prismaQueries = [];

        for (const { productCode, stockAdjustment } of stockUpdates) {
            prismaQueries.push(
                prisma.products.update({
                    where: { productCode: productCode },
                    data: {
                        initialStock: {
                            increment: stockAdjustment, 
                        },
                    },
                })
            );
        }

        prismaQueries.push(
            prisma.invoices.update({
                where: {
                    invoiceId: invoiceIdToUpdate,
                    userId: userId,
                },
                data: {
                    name: updatedSaleData.name,
                    subject: updatedSaleData.subject,
                    paymentMethod: updatedSaleData.paymentMethod,
                    
                    invoiceDate: updatedSaleData.invoiceDate ? new Date(updatedSaleData.invoiceDate) : null, 
                
                    discountPrice: discount,
                    invoiceSubtotal: rawSubtotal,
                    totalAmount: finalTotal,

                    lineItems: {
                        deleteMany: {}, 
                        createMany: {
                            data: calculatedLineItems.map(item => ({
                                productCode: item.productCode,
                                quantitySold: item.quantitySold,
                                sellingPrice: item.sellingPrice,
                                lineSubtotal: item.lineSubtotal, 
                            })),
                        },
                    },
                },
            })
        );
        
        const [/* ...stockUpdatesResults */, updatedItem] = await prisma.$transaction(prismaQueries);

        res.status(200).json({ message: 'Item updated successfully and stock adjusted.', item: updatedItem });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Item/Product not found or invoice doesn't belong to the user." });
        }
        // Handle potential stock depletion error here if your database enforces checks (e.g., stock cannot be negative)
        console.error("Error updating item or stock:", error);
        res.status(500).json({ error: 'Failed to update item and/or stock in database.' });
    }
});



app.get("/api/lineitems/:invoiceId", authenticateToken, async (req, res) => {
  const invoiceId = req.params.invoiceId;
  const userId = req.user.id;

  try {
    const lineItemsData = await prisma.lineItems.findMany({
      where:{
        invoiceId : invoiceId
      }
    })
    res.json(lineItemsData);

  }catch(error){
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to retrieve transactions data." });
  }
});



/* -------------------- DATA INVENTORY STUFF -------------------- */
// This route appears to be a duplicate of /api/inventory, so it's adjusted to be redundant.
// app.get("/inventory", authenticateToken, (req, res) => {
//   const userId = req.user.id;
//   fs.readFile(INVENTORY_FILE, "utf-8", (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to read data file" });
//     }
//     const inventory = JSON.parse(data);
//     const userInventory = inventory.filter(item => item.userId === userId);
//     res.json(userInventory);
//   });
// });

// app.put('/api/inventory/:id', authenticateToken, (req, res) => {
//   const selectedProductCode = req.params.id;
//   const editedItem = req.body;
//   const userId = req.user.id;

//   fs.readFile(INVENTORY_FILE, 'utf-8', (err, data) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Failed to read data file' });
//     }

//     let inventory = [];
//     try {
//       inventory = JSON.parse(data);
//     } catch (parseErr) {
//       console.error(parseErr);
//       return res.status(500).json({ error: 'Failed to parse JSON data' });
//     }

//     // Find the product that matches both the product code AND the user ID
//     const productIndex = inventory.findIndex(item => item.productCode === selectedProductCode && item.userId === userId);

//     if (productIndex !== -1) {
//       const updatedItem = {
//         ...inventory[productIndex],
//         ...editedItem,
//         lastUpdated: new Date().toISOString().split('T')[0]
//       };
      
//       inventory[productIndex] = updatedItem;

//       fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2), (writeErr) => {
//         if (writeErr) {
//           console.error(writeErr);
//           return res.status(500).json({ error: 'Failed to save item' });
//         }
//         res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
//       });
//     } else {
//       res.status(404).send('Item not found or does not belong to the user.');
//     }
//   });
// });

// DELETE (remove a transaction item)
// app.delete("/api/sales/:id", authenticateToken, (req, res) => {
//   const id = req.params.id;
//   const userId = req.user.id;

//   fs.readFile(SALES_FILE, "utf8", (err, data) => {
//     if (err) {
//       console.error("Failed to read sales file:", err);
//       return res.status(500).json({ error: "Failed to read sales file" });
//     }

//     let sales = [];
//     try {
//       sales = JSON.parse(data || "[]");
//     } catch (parseErr) {
//       console.error("Failed to parse sales JSON:", parseErr);
//       return res.status(500).json({ error: "Invalid sales data" });
//     }

//     // Filter to only include sales that belong to the user AND don't match the ID
//     const newSales = sales.filter((sale) => !(String(sale.invoiceId) === String(id) && sale.userId === userId));

//     const itemRemoved = newSales.length < sales.length;
//     if (!itemRemoved) {
//       return res.status(404).json({ error: "Sale not found or does not belong to the user" });
//     }

//     fs.writeFile(SALES_FILE, JSON.stringify(newSales, null, 2), (writeErr) => {
//       if (writeErr) {
//         console.error("Failed to write sales file:", writeErr);
//         return res.status(500).json({ error: "Failed to save sales file" });
//       }
//       res.json({ success: true, message: "Sale deleted successfully." });
//     });
//   });
// });

/* -------------------- DASHBOARD ROUTES (NEW) -------------------- */

// GET Dashboard Summary (Total Sales, Profit, Low Stock, Total Customers)
app.get("/api/dashboard/summary", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // 1. Total Sales: Sum of totalAmount from Invoices
    const totalSalesResult = await prisma.invoices.aggregate({
      where: { userId: userId },
      _sum: { totalAmount: true },
    });
    const totalSales = totalSalesResult._sum.totalAmount;

    // 2. Total Profit: Sum of (sellingPrice - unitCost) * quantitySold for all LineItems
    const lineItemsProfit = await prisma.lineItems.findMany({
      where: {
        invoice: {
          userId: userId,
        },
      },
      // 💡 FIX: Use ONLY 'select' at the top level
      select: { 
        quantitySold: true,
        sellingPrice: true,
        // 💡 FIX: To get the relation, we select the relation itself and then select its fields
        product: { 
          select: { 
            unitCost: true // This gets the cost from the related Products table
          },
        },
      },
    });

    let totalProfit = 0;
    lineItemsProfit.forEach(item => {
      // Use parseFloat() on Decimal types returned by Prisma before calculation
      // The structure is now item.product.unitCost
      const sellingPrice = parseFloat(item.sellingPrice) || 0;
      const unitCost = parseFloat(item.product.unitCost) || 0; 
      const quantity = item.quantitySold;

      const profitPerItem = (sellingPrice - unitCost) * quantity;
      totalProfit += profitPerItem;
    });

    const allProducts = await prisma.products.findMany({
      where: { userId: userId },
      select: {
        initialStock: true,
        thresholdStock: true
      }
    });
    
    // Calculate count by filtering in JavaScript
    const lowStockCount = allProducts.filter(item => {
        const initial = item.initialStock;
        const threshold = item.thresholdStock;
        return initial <= threshold && initial > 0;
    }).length;

    const uniqueCustomerSubjects = await prisma.invoices.findMany({
        where: { userId: userId },
        distinct: ['subject'], 
        select: { subject: true },
    });
    const totalCustomers = uniqueCustomerSubjects.length;

    res.json({
      totalSales: totalSales,
      totalProfit: totalProfit,
      lowStockItems: lowStockCount,
      totalCustomers: totalCustomers,
    });
  } catch (error) {
    console.error("CRASH DEBUG: Dashboard summary failed:", error);
    res.status(500).json({ error: "An internal database error occurred while calculating summary." });
  }
});

// GET Top 5 Best-Selling Products
app.get("/api/dashboard/top-selling-products", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Aggregate by productCode and sum quantity sold
    const topProducts = await prisma.lineItems.groupBy({
      by: ['productCode'],
      where: {
        invoice: { userId: userId },
      },
      _sum: {
        quantitySold: true,
      },
      orderBy: {
        _sum: {
          quantitySold: 'desc', // Order by total quantity sold descending
        },
      },
      take: 5, // Get top 5
    });

    // To get product details (name, brand) for these top products,
    // we need to fetch them separately after the aggregation.
    const productCodes = topProducts.map(p => p.productCode);
    const productDetails = await prisma.products.findMany({
      where: {
        userId: userId,
        productCode: { in: productCodes },
      },
      select: {
        productCode: true,
        productName: true,
        productBrand: true,
      },
    });

    // Map the aggregated data with product details
    const result = topProducts.map(tp => {
      const detail = productDetails.find(pd => pd.productCode === tp.productCode);
      return {
        productCode: tp.productCode,
        productName: detail ? detail.productName : 'Unknown Product',
        productBrand: detail ? detail.productBrand : 'Unknown Brand',
        totalQuantitySold: tp._sum.quantitySold,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    res.status(500).json({ error: "Failed to fetch top-selling products." });
  }
});

// GET 5 Most Recent Transactions
app.get("/api/dashboard/recent-transactions", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const recentInvoices = await prisma.invoices.findMany({
      where: { userId: userId },
      orderBy: {
        invoiceDate: 'desc', // Assuming invoiceDate is stored as a sortable string or DateTime
      },
      take: 5, // Get top 5 most recent
      // Include line items to get product info, or simplify for dashboard view
      include: {
        lineItems: {
          include: {
            product: {
              select: { productName: true }, // Select only what's needed for dashboard
            },
          },
        },
      },
    });

    // Format for easier consumption on the frontend
    const formattedTransactions = recentInvoices.map(invoice => ({
      invoiceId: invoice.invoiceId,
      customerName: invoice.subject, // Assuming subject is customer name
      invoiceDate: invoice.invoiceDate,
      totalQuantity: invoice.lineItems.reduce((sum, item) => sum + item.quantitySold, 0),
      totalAmount: invoice.totalAmount,
      // You might want to show names of products if only one line item, or just quantity/total
      products: invoice.lineItems.map(li => li.product.productName).join(', ') // Or process differently
    }));


    res.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch recent transactions." });
  }
});

/* -------------------- DATA TRANSACTIONS STUFF -------------------- */
// This route is a duplicate of /api/sales and is adjusted to be redundant.
// app.get("/transactions", authenticateToken, (req, res) => {
//   const userId = req.user.id;
//   fs.readFile(SALES_FILE, "utf-8", (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to read data file" });
//     }
//     const sales = JSON.parse(data);
//     const userSales = sales.filter(sale => sale.userId === userId);
//     res.json(userSales);
//   });
// });


/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// const fs = require('fs');
// const path = require('path');

// File paths
// const INVENTORY_FILE = path.join(__dirname, "data", "inventoryItems.json");
// const SALES_FILE = path.join(__dirname, "data", "transactions.json");
// const USERS_FILE = path.join(__dirname, "data", "users.json");

// old DELETE USING FS
// app.delete("/api/inventory/:id", authenticateToken, (req, res) => {
//   const id = req.params.id;
//   const userId = req.user.id;

//   fs.readFile(INVENTORY_FILE, "utf8", (err, data) => {
//     if (err) {
//       console.error("Failed to read inventory file:", err);
//       return res.status(500).json({ error: "Failed to read inventory file" });
//     }

//     let inventory = [];
//     try {
//       inventory = JSON.parse(data || "[]");
//     } catch (parseErr) {
//       console.error("Failed to parse inventory JSON:", parseErr);
//       return res.status(500).json({ error: "Invalid inventory data" });
//     }

//     // Filter to only include items that belong to the user AND don't match the ID
//     const newInventory = inventory.filter(
//       (item) => !(String(item.productCode) === String(id) && item.userId === userId)
//     );
    
//     // Check if the item was found and removed
//     const itemRemoved = newInventory.length < inventory.length;
//     if (!itemRemoved) {
//         return res.status(404).json({ error: "Item not found or does not belong to the user" });
//     }

//     fs.writeFile(INVENTORY_FILE, JSON.stringify(newInventory, null, 2), (writeErr) => {
//       if (writeErr) {
//         console.error("Failed to write inventory file:", writeErr);
//         return res.status(500).json({ error: "Failed to save inventory file" });
//       }
//       res.json({ success: true });
//     });
//   });
// });

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

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


// fs.readFile(SALES_FILE, "utf8", (err, data) => {
//   if (err) return res.status(500).json({ error: "Failed to read sales file" });
//   const sales = JSON.parse(data);
//   const userSales = sales.filter(sale => sale.userId === userId);
//   res.json(userSales);
// });