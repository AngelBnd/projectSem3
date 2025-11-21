const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);


router.get("/lineitems/:invoiceId", authenticateToken, async (req, res) => {
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
      console.errsor("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to retrieve transactions data." });
  }
});

module.exports = router;