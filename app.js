const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const nodemailer = require("nodemailer");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const book = require("./model/book");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS setup (optional, if you use it)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================== CONTACT ROUTE ==================
app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER, // from .env
        pass: process.env.SMTP_PASS, // from .env
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER, // recipient (your email)
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
          <h2 style="color: #05b3a4;">📚 Modern Library Contact Form</h2>
          <p>${message}</p>
          <p><strong>From:</strong> ${name} (${email})</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ================== BOOK ROUTES ==================
app.get("/books", async (req, res) => {
  try {
    const books = await book.find();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const foundBook = await book.findById(req.params.id);
    if (!foundBook) return res.status(404).json({ message: "Book not found" });
    res.json(foundBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching the book" });
  }
});

// ================== ROUTERS ==================
app.use("/admin", adminRouter);
app.use("/shop", shopRouter);

// ================== MONGO CONNECTION ==================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
