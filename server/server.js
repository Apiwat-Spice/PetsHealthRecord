const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pet");
const appointmentRoutes = require('./routes/appointment');
const profileRoutes = require('./routes/profile');
const visitRoutes = require("./routes/visitRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/pets", petRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use("/api/clinics", require("./routes/clinic"));
app.use("/api/visit-records", visitRoutes);

app.listen(3000, () => {
  console.log("Server Start on port 3000");
});