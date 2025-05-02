const jwt = require('jsonwebtoken');

module.exports = (allowedRoles) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userRole = decoded.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
  