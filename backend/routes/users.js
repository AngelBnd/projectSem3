const express = require("express");
const authenticateToken = require("../middleware/auth");
const usersController = require("../controllers/users.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/", usersController.list);
router.post("/:userId/approve", authenticateToken, usersController.approve);
router.post("/:userId/reject", authenticateToken, usersController.reject);

module.exports = router;
