import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ;

export const protect = (req, res, next) => {
  // Accept token from Authorization header OR httpOnly cookie
  const headerToken = req.headers.authorization?.split(' ')[1];
  const cookieToken = req.cookies?.gh_token;
  const token = headerToken || cookieToken;

  if (!token)
    return res.status(401).json({ success: false, message: 'Not authorized — no token provided.' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token is invalid or has expired. Please login again.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  next();
};

export const JWT_SECRET_KEY = JWT_SECRET;
