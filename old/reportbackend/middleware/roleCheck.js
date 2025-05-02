module.exports = (allowedRoles) => (req, res, next) => {
    const userRole = req.headers['x-role'];  // Fetching the role from the request header
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    next();
  };
  