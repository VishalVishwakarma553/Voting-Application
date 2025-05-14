const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("connected", () => {
  console.log("connected to the mongoDB server");
});
db.on("disconnected", () => {
  console.log("mongoDB disconnected");
});
db.on("error", (err) => {
  console.log("MongoDB erorr connection:", err);
});
module.exports = db;
