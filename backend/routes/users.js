const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const currentUser = req.user; 
    console.log(currentUser);

    if (!currentUser.storeId) {
      return res.status(400).json({ error: "User does not belong to a store" });
    }

    const users = await prisma.users.findMany({
      where: {
            OR: [
            { storeId: currentUser.store?.storeId },
            { requestedStoreTag: currentUser.store?.storeTag },
            ],
        },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    console.log("BACKEND USERS==========");
    console.log(users);

    res.json({ users });
  } catch (error) {
    console.error("Error fetching store users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post('/:userId/approve', authenticateToken,async (req, res) => {
    const { userId } = req.params;

    try {
      const targetUser = await prisma.users.findUnique({ where: { userId: parseInt(userId) } });
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      if (targetUser.storeId !== req.user.storeId) {
        return res.status(403).json({ error: 'Cannot approve user from another store' });
      }

      const updatedUser = await prisma.users.update({
        where: { userId: parseInt(userId) },
        data: {
          status: 'ACTIVE',
          approvedAt: new Date(),
          approvedBy: req.user.userId,
        },
      });

      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to approve user' });
    }
  }
);

router.post('/:userId/reject', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
      const targetUser = await prisma.users.findUnique({ where: { userId: parseInt(userId) } });
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      if (targetUser.storeId !== req.user.storeId) {
        return res.status(403).json({ error: 'Cannot reject user from another store' });
      }

      const updatedUser = await prisma.users.update({
        where: { userId: parseInt(userId) },
        data: {
          status: 'REJECTED',
          approvedAt: new Date(),
          approvedBy: req.user.userId,
        },
      });

      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to reject user' });
    }
  }
);

module.exports = router;