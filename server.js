require("dotenv").config();
const express = require("express");
const db = require("./db");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const candidateRoutes = require('./routes/candidateRoutes')
app.use("/candidate", candidateRoutes)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port 3000");
});
