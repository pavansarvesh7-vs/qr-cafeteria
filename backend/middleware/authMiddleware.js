const jwt = require("jsonwebtoken");

/**
 * 🛡️ Higher-Order Role-Based Access Control Middleware Factory
 * @param {string} requiredRole - Optional role requirement restriction (e.g., 'admin')
 */
const authMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access Denied: Missing or malformed authentication header." });
      }

      // Extract raw token signature string
      const token = authHeader.split(" ")[1];
      
      // Decrypt session token metadata
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = decoded; 

      // If route demands a higher privilege level, validate credential clearance
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: `Forbidden: Restricted to ${requiredRole} access levels.` });
      }

      next(); // Pass safely to route processing controllers
    } catch (error) {
      return res.status(401).json({ message: "Access Denied: Token is invalid or expired." });
    }
  };
};

module.exports = authMiddleware;