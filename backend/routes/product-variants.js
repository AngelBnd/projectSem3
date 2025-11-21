const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get("/", authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser.storeId) {
      return res.status(400).json({
        error: "User does not belong to a store",
      });
    }

    const variants = await prisma.productVariants.findMany({
      where: {
        storeId: currentUser.storeId,
      },
      include: {
        product: true, 
        productVariantAttributes : {
            include : {
                attributeValue : {
                        include : {
                            attribute : true,
                        }
                },
            },
        },
      },
      orderBy: {
        productVariantId: "asc",
      },
    });

    console.log(variants);

    const formatted = variants.map((v) => {
            
      const attrValues = v.productVariantAttributes
        .map((pva) => pva.attributeValue?.valueName)
        .filter(Boolean);

      const sortedAttributes = v.productVariantAttributes
        .sort((a, b) =>
          a.attributeValue.attribute.name.localeCompare(
            b.attributeValue.attribute.name
          )
        )
        .map((pva) => pva.attributeValue.valueName);

      const variantName = [
        v.product?.productName,
        ...sortedAttributes,
      ].join(" ").trim();

      console.log(variantName);
        
    return {
      productVariantId: v.productVariantId,
      productId: v.productId,

      sku: v.sku,
      barcode: v.barcode,

      productName: v.product?.productName || "",
      variantName : variantName,

      sellingPrice: v.sellingPrice ?? 0,
      costPrice: v.costPrice ?? 0,
      thresholdStock: v.thresholdStock ?? 0,

      productStatus: v.productStatus,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }});

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching product variants:", error);
    res.status(500).json({ error: "Failed to retrieve product variants." });
  }
});


module.exports = router;