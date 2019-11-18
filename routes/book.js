const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Author = require("../models/Author");

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// All book route
router.get("/", async (req, res) => {
  let query = Book.find();
  // Check title
  if (req.query.title) {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  // Check publish date
  if (req.query.publishAfter) {
    query = query.gte("publishDate", req.query.publishAfter);
  }
  if (req.query.publishBefore) {
    query = query.lte("publishDate", req.query.publishBefore);
  }
  try {
    const books = await query.exec();
    res.render("book/index", {
      books: books,
      searchOption: req.query
    });
  } catch {
    res.redirect("/");
  }
});

// New book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create book route
router.post("/new", async (req, res) => {
  // Init Book
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  });
  // Init cover book
  saveCover(book, req.body.cover);
  // Save book
  try {
    const newBook = await book.save();
    // res.redirect(`book/${newBook.id}`);
    res.redirect("/book");
  } catch {
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    // Nếu có lỗi
    if (hasError) params.errorMessage = "Error Creating Book";
    res.render("book/new", params);
  } catch {
    res.redirect("/book");
  }
}

function saveCover(book, coverEncoded) {
  if (!coverEncoded) return;
  const cover = JSON.parse(coverEncoded);
  if (cover && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
