const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      admin: decodedToken.admin,
      authorized: decodedToken.authorized
    };
    if (req.userData.admin) {
      next();
    } else {
      res.status(401).json({ message: 'Admin Auth failed!' });
    }    
  } catch (error) {
    res.status(401).json({ message: 'Auth failed!' });
  }
};
