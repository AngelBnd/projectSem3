const dashboardService = require("../services/dashboard.service");
const { sendError } = require("../utils/httpError");

const getSummary = async (req, res) => {
  const storeId = req.user.store.storeId;

  try {
    res.json(await dashboardService.getSummary(storeId));
  } catch (error) {
    sendError(res, error, "Dashboard summary error:", {
      error: "Failed to calculate sales dashboard summary",
    });
  }
};

const getTopSellingProducts = async (req, res) => {
  const storeId = req.user.storeId;
  try {
    res.json(
      await dashboardService.getTopSellingProducts(storeId, req.query.period)
    );
  } catch (error) {
    sendError(res, error, "Error fetching top-selling products:", {
      error: "Failed to fetch top-selling products.",
    });
  }
};

const getRecentTransactions = async (req, res) => {
  const storeId = req.user.storeId;
  try {
    res.json(await dashboardService.getRecentTransactions(storeId));
  } catch (error) {
    sendError(res, error, "Error fetching recent transactions:", {
      error: "Failed to fetch recent transactions.",
    });
  }
};

const exportPdf = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const pdfBuffer = await dashboardService.exportPdf(token);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="dashboard.pdf"',
    });

    res.send(pdfBuffer);
  } catch (error) {
    sendError(res, error, null, { message: "Failed to export dashboard" });
  }
};

module.exports = {
  getSummary,
  getTopSellingProducts,
  getRecentTransactions,
  exportPdf,
};
