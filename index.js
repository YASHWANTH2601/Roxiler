const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // console.log(`http://localhost:${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
