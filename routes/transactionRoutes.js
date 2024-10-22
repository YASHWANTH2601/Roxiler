const express = require("express");
const router = express.Router();
const {
  initializeData,
  listTransactions,
  statistics,
  barChart,
  pieChart,
  combinedData,
} = require("../controllers/transactionController");

router.get("/init", initializeData);
router.get("/transactions", listTransactions);
router.get("/statistics", statistics);
router.get("/bar-chart", barChart);
router.get("/pie-chart", pieChart);
router.get("/combined-data", combinedData);

module.exports = router;
