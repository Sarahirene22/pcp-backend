import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const instructorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'INSTRUCTOR') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an instructor' });
  }
};

export const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'STUDENT') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a student' });
  }
};
