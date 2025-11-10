// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const router = express.Router();


const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  const { 
    email,
    password, 
    role, 
    firstName, 
    lastName, 
    phoneNumber,
    storeName, 
    storeTag 
  } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let result;

    if (role === 'owner') {
      if (!storeName || !storeTag) {
        return res.status(400).json({ error: 'Store name and tag are required for owners' });
      }

      const existingStore = await prisma.stores.findUnique({ where: { storeTag } });
      if (existingStore) return res.status(400).json({ error: 'Store tag already exists' });

      // Owner flow
      result = await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            phoneNumber: phoneNumber || '',
            passwordHash: hashedPassword,
            status: 'ACTIVE'
          }
          });

          const store = await tx.stores.create({
            data: { storeName, storeTag, ownerId: user.userId }
          });

          const adminRole = await tx.roles.create({
            data: { storeId: store.storeId, roleName: 'Admin' }
          });

          await tx.userRoles.create({
            data: { userId: user.userId, roleId: adminRole.roleId, isPrimary: true }
          });

          await tx.users.update({
            where: { userId: user.userId },
            data: { storeId: store.storeId }
          });

        return { user, store };
      });
    } else if (role === 'employee') {
      if (!storeTag) return res.status(400).json({ error: 'Store tag is required' });

      const store = await prisma.stores.findUnique({ where: { storeTag } });
      if (!store) return res.status(400).json({ error: 'Store not found' });

      // Employee flow
      const user = await prisma.users.create({
        data: {
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          phoneNumber: phoneNumber || '',
          passwordHash: hashedPassword,
          status: 'PENDING_APPROVAL',
          requestedStoreTag: storeTag
        }
      });

      result = { user };
    }

    return res.status(201).json({ message: 'User registered successfully', result });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        store: true,
        userRoles: {
          include: {
            role: {  
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const permissions = user.userRoles.flatMap(userRole =>
      userRole.role.rolePermissions.map(rp => 
        `${rp.permission.module}:${rp.permission.permission}`
      )
    );

    const roleNames = user.userRoles.map(ur => ur.role.roleName);
    const primaryRole = user.userRoles.find(ur => ur.isPrimary)?.role.roleName || roleNames[0];

    const token = jwt.sign(
      {
        userId: user.userId,
        store : user.store,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        primaryRole,
        permissions
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.userId,
        store : user.store,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: roleNames,
        primaryRole,
        permissions
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// AUth
router.post('/validate', async (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({ error: 'Field and value are required' });
  }

  try {
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const existingUser = await prisma.users.findUnique({ 
        where: { email: value } 
      });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    } else if (field === 'storeTag') {
      const existingStore = await prisma.stores.findUnique({ 
        where: { storeTag: value } 
      });
      if (existingStore) {
        return res.status(409).json({ error: 'Store tag already exists' });
      }
    }

    res.json({ valid: true, message: `${field} is available` });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

module.exports = router;
