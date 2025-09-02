const express = require('express');
const Router = express.Router();
const multer = require('multer');
const Book = require('../model/book');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary is already configured via CLOUDINARY_URL in .env

// Storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'library-books',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Storage for PDFs (must use raw)
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'library-books',
    resource_type: 'raw', // important for PDFs
    allowed_formats: ['pdf'],
  },
});

// Custom storage selector for multer
const storage = {
  _handleFile(req, file, cb) {
    if (file.fieldname === 'image') {
      imageStorage._handleFile(req, file, cb);
    } else if (file.fieldname === 'pdf') {
      pdfStorage._handleFile(req, file, cb);
    } else {
      cb(new Error('Unexpected field: ' + file.fieldname));
    }
  },
  _removeFile(req, file, cb) {
    if (file.fieldname === 'image') {
      imageStorage._removeFile(req, file, cb);
    } else if (file.fieldname === 'pdf') {
      pdfStorage._removeFile(req, file, cb);
    }
  }
};

// Multer instance that accepts both fields
const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

// ================== ROUTES ==================

Router.get('/addbook', (req, res) => {
  res.render('addbook', { message: null, error: null });
});
// ===================================================

// POST form with file + fields
Router.post('/addbookaction', (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.render('addbook', { message: `Upload error: ${err.message}`, error: true });
    }

    try {
    
      const { title, author, genre, language, year, pages, description, rating, comment } = req.body;

      const imageUrl = req.files['image']?.[0]?.path;
      const pdfUrl = req.files['pdf']?.[0]?.path;

      if (!imageUrl || !pdfUrl) {
        return res.render('addbook', { message: 'Image and PDF are required!', error: true });
      }

      const newBook = new Book({
        title,
        author,
        genre,
        language,
        year: parseInt(year, 10),
        pages: parseInt(pages, 10),
        description,
        image: imageUrl,
        pdf: pdfUrl,
        ratings: rating ? [{ rating: parseInt(rating, 10), comment }] : [],
      });

      const savedBook = await newBook.save();

      res.redirect('/shop/books');
    } catch (err) {
      console.error('Error saving book:', err);
      res.render('addbook', { message: `Error saving book: ${err.message}`, error: true });
    }
  });
});

module.exports = Router;
