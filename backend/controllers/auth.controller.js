const authService = require("../services/auth.service");
const { sendError } = require("../utils/httpError");

const register = async (req, res) => {
  try {
    res.status(201).json(await authService.register(req.body));
  } catch (error) {
    sendError(res, error, "Registration error:", {
      error: "An unexpected error occurred",
    });
  }
};

const login = async (req, res) => {
  try {
    res.json(await authService.login(req.body));
  } catch (error) {
    sendError(res, error, null, { error: "Login failed" });
  }
};

const validateField = async (req, res) => {
  try {
    res.json(await authService.validateField(req.body));
  } catch (error) {
    sendError(res, error, "Validation error:", { error: "Validation failed" });
  }
};

module.exports = { register, login, validateField };
