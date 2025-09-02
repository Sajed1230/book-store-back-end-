const express = require('express');
const Book = require('../model/book'); 
const Router = express.Router();

Router.get("/books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    
    res.render('books', { books }); 
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).send("Error fetching books");
  }
});


Router.post("/books/delete/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).send("Book not found");
    }
    res.redirect("/shop/books"); 
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).send("Error deleting book");
  }
});









module.exports = Router;
