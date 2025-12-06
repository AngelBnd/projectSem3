const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user; 
        console.log("CURRENT USER TEST", currentUser);

        if (!currentUser.storeId) {
        return res.status(400).json({ error: "User does not belong to a store" });
        }

        // if (category && category !== 'All') {
        //     whereClause.productCategory = category;
        // }

        const products = await prisma.products.findMany({
            where: {
                storeId : currentUser.storeId
            }
        });

        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to retrieve products." });
    }
});


module.exports = router;