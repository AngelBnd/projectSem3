const usersService = require("../services/users.service");
const { sendError } = require("../utils/httpError");

const list = async (req, res) => {
  try {
    res.json(await usersService.listStoreUsers(req.user));
  } catch (error) {
    sendError(res, error, "Error fetching store users:", {
      error: "Failed to fetch users",
    });
  }
};

const approve = async (req, res) => {
  try {
    res.json(await usersService.approve(req.user, req.params.userId));
  } catch (error) {
    sendError(res, error, null, { error: "Failed to approve user" });
  }
};

const reject = async (req, res) => {
  try {
    res.json(await usersService.reject(req.user, req.params.userId));
  } catch (error) {
    sendError(res, error, null, { error: "Failed to reject user" });
  }
};

module.exports = { list, approve, reject };
