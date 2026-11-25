import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import Admin from '../models/Admin.js';

await connectDatabase();
const { ADMIN_NAME = 'NAVRIVA Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD with at least 12 characters in backend/.env');
}
const email = ADMIN_EMAIL.toLowerCase().trim();
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await Admin.findOneAndUpdate({ email }, { name: ADMIN_NAME, email, passwordHash }, { upsert: true, new: true, setDefaultsOnInsert: true });
console.log(`Admin account ready for ${email}`);
await (await import('mongoose')).default.disconnect();
