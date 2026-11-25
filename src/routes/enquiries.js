import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import Enquiry from '../models/Enquiry.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public website contact form.
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone = '', service, message } = req.body || {};
    if (![name, email, service, message].every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Please complete all required fields.' });
    }
    if (!emailPattern.test(email.trim()) || name.trim().length > 100 || message.trim().length > 5000) {
      return res.status(400).json({ message: 'Please check your details and try again.' });
    }
    const enquiry = await Enquiry.create({ name, email, phone, service, message });
    res.status(201).json({ message: 'Your enquiry has been received. Thank you!', id: enquiry.id });
  } catch (error) { next(error); }
});

// Admin-only inbox.
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(300).lean();
    res.json({ enquiries });
  } catch (error) { next(error); }
});

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['new', 'contacted', 'closed'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid enquiry status.' });
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    res.json({ enquiry });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    res.json({ message: 'Enquiry deleted.' });
  } catch (error) { next(error); }
});
export default router;
