import express from 'express';
import Contact from '../models/Contact.js';
import { sendContactEmail } from '../services/email.service.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    // Validation
    if (!name || !email || !subject || !category || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields'
      });
    }

    // Save to database
    const newContact = new Contact({
      name,
      email,
      subject,
      category,
      message
    });

    await newContact.save();

    // Send email
    try {
      await sendContactEmail({ name, email, subject, category, message });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // We don't fail the request if email fails, since we saved it to DB
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: newContact
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;
