const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    pdf: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    pages: { type: Number, required: true },
    language: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    ratings: [
      {
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bookSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / this.ratings.length;
});

module.exports = mongoose.model("Book", bookSchema);
