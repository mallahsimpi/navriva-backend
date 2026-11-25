import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = Router();
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, {
      subject: admin.id,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
    res.json({ token, admin: { name: admin.name, email: admin.email } });
  } catch (error) { next(error); }
});
export default router;
