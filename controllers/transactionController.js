const axios = require("axios");
const Transaction = require("../models/transaction");

// Fetch and Seed Data from Third-Party API
const initializeData = async (req, res) => {
  try {
    // Fetch data from the third-party API
    const { data } = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );

    // Insert data into MongoDB
    await Transaction.insertMany(data);

    res.status(200).json({ message: "Database initialized with seed data" });
  } catch (error) {
    res.status(500).json({ error: "Error initializing data", details: error });
  }
};

const listTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = "", month } = req.query;
  const monthFilter = month
    ? new Date(`2022-${month}-01`).getMonth() + 1
    : null;

  let query = {};
  if (search) {
    query = {
      $or: [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { price: { $eq: parseFloat(search) } },
      ],
    };
  }

  if (monthFilter) {
    query.dateOfSale = {
      $gte: new Date(`2022-${monthFilter}-01`),
      $lt: new Date(`2022-${monthFilter + 1}-01`),
    };
  }

  const transactions = await Transaction.find(query)
    .skip((page - 1) * perPage)
    .limit(parseInt(perPage));

  res.json(transactions);
};

const statistics = async (req, res) => {
  const { month } = req.query;
  const monthFilter = new Date(`2022-${month}-01`).getMonth() + 1;

  const totalSales = await Transaction.aggregate([
    {
      $match: {
        dateOfSale: {
          $gte: new Date(`2022-${monthFilter}-01`),
          $lt: new Date(`2022-${monthFilter + 1}-01`),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSalesAmount: { $sum: "$price" },
        totalSold: { $sum: { $cond: ["$sold", 1, 0] } },
        totalNotSold: { $sum: { $cond: ["$sold", 0, 1] } },
      },
    },
  ]);

  res.json(
    totalSales[0] || { totalSalesAmount: 0, totalSold: 0, totalNotSold: 0 }
  );
};

const barChart = async (req, res) => {
  const { month } = req.query;
  const monthFilter = new Date(`2022-${month}-01`).getMonth() + 1;

  const priceRanges = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const priceRangeBuckets = await Transaction.aggregate([
    {
      $match: {
        dateOfSale: {
          $gte: new Date(`2022-${monthFilter}-01`),
          $lt: new Date(`2022-${monthFilter + 1}-01`),
        },
      },
    },
    {
      $bucket: {
        groupBy: "$price",
        boundaries: priceRanges,
        default: "901-above",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  res.json(priceRangeBuckets);
};

const pieChart = async (req, res) => {
  const { month } = req.query;
  const monthFilter = new Date(`2022-${month}-01`).getMonth() + 1;

  const categories = await Transaction.aggregate([
    {
      $match: {
        dateOfSale: {
          $gte: new Date(`2022-${monthFilter}-01`),
          $lt: new Date(`2022-${monthFilter + 1}-01`),
        },
      },
    },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  res.json(categories);
};

const combinedData = async (req, res) => {
  const { month } = req.query;

  const [transactions, stats, bar, pie] = await Promise.all([
    listTransactions(req, res),
    statistics(req, res),
    barChart(req, res),
    pieChart(req, res),
  ]);

  res.json({ transactions, stats, bar, pie });
};

module.exports = {
  initializeData,
  listTransactions,
  statistics,
  barChart,
  pieChart,
  combinedData,
};
