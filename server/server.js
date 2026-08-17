const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Server Start");
});