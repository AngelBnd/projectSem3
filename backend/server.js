require('dotenv').config();

const express = require("express");
const cors = require("cors");
const routes = require('./routes')
const authenticateToken = require('./middleware/auth.js'); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.use('/api/login', routes);
app.use('/api/register', routes);
app.use(authenticateToken);
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 