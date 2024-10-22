const mongoose = require("mongoose");

// CRpmN8c3jS9AyFqD
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://yashwanth2601:CRpmN8c3jS9AyFqD@transactionsdb.zqxoh.mongodb.net/?retryWrites=true&w=majority&appName=transactionsDB"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
