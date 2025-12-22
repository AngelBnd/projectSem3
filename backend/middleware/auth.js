require('dotenv').config();
console.log('BYPASS_AUTH:', process.env.BYPASS_AUTH);
const prisma = require('../prisma/client');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const publicRoutes = [
  'https://stockapi.jessfortress.com/api/auth/login',
  'https://stockapi.jessfortress.com/api/auth/register',
];

const authenticateToken = async (req, res, next) => {
  console.log('🟢 Authentication test:', req.path);

  // 🟢 Skip login & register routes
  if (publicRoutes.some(route => req.originalUrl.startsWith(route))) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.users.findUnique({
      where: { userId: decoded.userId },
      include: { 
        store: true, 
        userRoles: { 
          include: { 
            role: { 
              include: { 
                rolePermissions: { include: { permission: true } } 
              } 
            } 
          } 
        } 
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = user; 
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
