const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
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
});

router.post('/', authenticateToken, async (req, res) => {
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

router.put('/:id', authenticateToken, async (req, res) => {
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

router.get("/categories", authenticateToken, async (req, res) => {
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

router.delete("/:id", authenticateToken, async (req, res) => {
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


router.get('/search', authenticateToken, async (req, res) => {
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


router.get('/:productCode', authenticateToken, async (req, res) => {
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

module.exports = router;