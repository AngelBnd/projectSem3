const salesOrderService = require("../services/sales-order.service");
const { sendError } = require("../utils/httpError");

const listChannels = async (req, res) => {
  try {
    res.status(200).json(await salesOrderService.listChannels(req.user));
  } catch (error) {
    sendError(res, error, "Prisma fetch error:", {
      error: "Failed to load channels",
    });
  }
};

const list = async (req, res) => {
  try {
    res.json(await salesOrderService.list(req.user, req.query));
  } catch (error) {
    sendError(res, error, "Fetch sales orders error:", {
      error: "Failed to fetch sales orders",
    });
  }
};

const getById = async (req, res) => {
  const storeId = req.user.store.storeId;
  try {
    res.json(await salesOrderService.getById(storeId, req.params.id));
  } catch (error) {
    sendError(res, error, "Fetch sales order error:", {
      error: "Failed to fetch sales order",
    });
  }
};

const create = async (req, res) => {
  try {
    res.status(200).json(await salesOrderService.create(req.user, req.body));
  } catch (error) {
    sendError(res, error, "Error creating order:", {
      error: "Failed to create sales order.",
    });
  }
};

const populateDemo = async (req, res) => {
  try {
    res.json(await salesOrderService.populateDemo(req.user));
  } catch (error) {
    sendError(res, error, "Populate sales order failed:", {
      error: "Failed to populate sales order",
    });
  }
};

const update = async (req, res) => {
  const storeId = req.user.store.storeId;
  try {
    res.json(
      await salesOrderService.update(storeId, req.params.id, req.body)
    );
  } catch (error) {
    sendError(res, error, "Update sales order error:", {
      error: "Failed to update sales order",
    });
  }
};

const remove = async (req, res) => {
  try {
    res.json(await salesOrderService.remove(req.user.storeId, req.params.id));
  } catch (error) {
    sendError(res, error, null, { message: "Failed to delete sales order" });
  }
};

module.exports = {
  listChannels,
  list,
  getById,
  create,
  populateDemo,
  update,
  remove,
};
