const config = require("./config");
const path = require("path");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/auth.js");

const app = express();

app.use(cors());
app.use(express.json());

// Product images. Mounted before the auth middleware because <img> tags cannot
// send an Authorization header; filenames are random UUIDs.
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", authenticateToken, routes);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
