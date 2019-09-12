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
    if (req.userData.authorized) {
      next();
    } else {
      console.log("notAuthorized")
      res.status(401).json({ message: 'Você ainda não foi aceito pelo administrador' });
    }
  } catch (error) {
    console.log('Auth failed!')
    res.status(401).json({ message: 'Auth failed!' });
  }
};
