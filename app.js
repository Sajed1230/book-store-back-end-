const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const cors = require('cors');
const nodemailer = require("nodemailer");

const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const Book = require('./model/book');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS setup (if you use it)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =================== Nodemailer setup ===================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// =================== Routes ===================

// Contact route
app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false,
      error: "All fields are required" 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      error: "Please provide a valid email address" 
    });
  }

  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_USER) {
      console.log("Email configuration missing. Contact form data:", { name, email, subject, message });
      
      // In development, return success even if email isn't configured
      // In production, you should have email configured
      return res.status(200).json({ 
        success: true,
        message: "Message received! (Email not configured - check server logs for details)" 
      });
    }

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; border-radius: 12px; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #05b3a4; text-align:center;">📚 Modern Library Contact Form</h2>
          <div style="background: #fff; padding: 15px; border-radius: 8px; border-left: 4px solid #05b3a4;">
            <p style="font-size: 16px; color: #333; line-height: 1.5;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 14px; color: #555;">
              <strong>From:</strong> ${name}<br>
              <strong>Email:</strong> <a href="mailto:${email}">${email}</a><br>
              <strong>Subject:</strong> ${subject}
            </p>
          </div>
          <p style="text-align:center; font-size: 12px; color: #888; margin-top: 20px;">
            Thank you for contacting Modern Library!
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ 
      success: true,
      message: "Message sent successfully! We'll get back to you soon." 
    });

  } catch (error) {
    console.error("Error sending email:", error);
    
    // More detailed error handling
    let errorMessage = "Failed to send message";
    
    if (error.code === 'EAUTH') {
      errorMessage = "Email authentication failed. Please check email configuration.";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Could not connect to email server.";
    } else if (error.response) {
      errorMessage = `Email server error: ${error.response}`;
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Get all books
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Get book by ID
app.get("/books/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const foundBook = await Book.findById(id);
    if (!foundBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(foundBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching the book' });
  }
});

// Admin & Shop routes
app.use('/admin', adminRouter);
app.use('/shop', shopRouter);

// =================== MongoDB connection ===================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));

