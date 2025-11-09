// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  try {
    const existingUser = await prisma.users.findUnique({ where: { username } });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { username, password: hashedPassword },
      select: { id: true, username: true }
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body; 
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  try {
    const user = await prisma.users.findUnique({
      where: { username },
      include: {
        role: true,  
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ success: true, token, user: { id: user.id, username: user.username, name: user.name, role: user.role?.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});
module.exports = router;
