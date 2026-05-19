// Check if admin user has specific permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Check if user has the specific admin permission
    if (!req.user.adminPermissions || !req.user.adminPermissions[permission]) {
      return res.status(403).json({ 
        message: `You don't have permission to ${permission}` 
      });
    }

    next();
  };
};
