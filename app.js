const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables at the top
const cors = require('cors');
const nodemailer = require("nodemailer");
const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');

const book = require('./model/book');

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if you have any local uploads or assets)

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
///.............................................................

//======================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "jokersajed11@gmail.com",
    pass: process.env.SMTP_PASS || "fyyq qhgj mtku sxgx", // For production, put this in .env
  },
});

// Single /contact route
app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

const mailOptions = {
  from: `"${name}" <${email}>`,   // sender
  to: process.env.EMAIL_USER || "jokersajed11@gmail.com", // recipient
  subject,
  text: message, // fallback for email clients that don't render HTML
  html: `
  <div style="
    font-family: Arial, sans-serif; 
    background: #f9f9f9; 
    padding: 20px; 
    border-radius: 12px;
    max-width: 600px;
    margin: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  ">
    <h2 style="color: #05b3a4; text-align:center; animation: fadeIn 1s;">📚 Modern Library Contact Form</h2>

    <div style="
      background: #fff; 
      padding: 15px; 
      border-radius: 8px; 
      border-left: 4px solid #05b3a4;
      animation: fadeIn 1.5s;
    ">
      <p style="font-size: 16px; color: #333; line-height: 1.5;">${message}</p>
      <p style="font-size: 14px; color: #555; margin-top: 20px;">From: <strong>${name}</strong> (${email})</p>
    </div>

    <p style="text-align:center; font-size: 12px; color: #888; margin-top: 20px;">
      Thank you for contacting Modern Library!
    </p>
  </div>

  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
  `,
};


    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

//======================================
app.get('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const foundBook = await book.findById(id); // use a different variable name
    if (!foundBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(foundBook);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching the book' });
  }
});

///.............................................................


app.get("/books", async (req, res) => {
  try {
    const books = await book.find();
    res.json(books);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

///.................................................

// const transporter = nodemailer.createTransport({
//   service: "gmail", // or any email service
//   auth: {
//     user: "jokersajed11@gmail.com", // your email
//     pass: "fyyq qhgj mtku sxgx", // app password for Gmail
//   }
// });

// ===================
app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Configure transporter
    let transporter = nodemailer.createTransport({
      service: "Gmail", // or any SMTP service
      auth: {
        user: "jokersajed11@gmail.com", // your Gmail/SMTP email
        pass: "fyyq qhgj mtku sxgx", // your email password or app password
      },
    });

    // Mail options
    let mailOptions = {
      from: email, // sender: the user's email
      to: process.env.EMAIL_USER, // recipient: your email
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});
















// Routes
app.use('/admin', adminRouter);
app.use('/shop', shopRouter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));
