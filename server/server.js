const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pet");
const vetRoutes = require('./routes/vet');

const appointmentRoutes = require('./routes/appointment');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api", vetRoutes);
app.use("/api", appointmentRoutes);

app.listen(3000, () => {
  console.log("Server Start");
});