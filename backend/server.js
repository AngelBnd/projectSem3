require('dotenv').config();

const express = require("express");
const cors = require("cors");
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/auth.js'); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', authenticateToken, routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 