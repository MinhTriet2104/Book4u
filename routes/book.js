const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Author = require("../models/Author");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// upload
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, cb) => {
    cb(null, imageMimeTypes.includes(file.mimetype));
  }
});

// All book route
router.get("/", async (req, res) => {
  let query = Book.find();
  // Check title
  if (req.query.title) {
    query = query.regex('title', new RegExp(req.query.title, 'i'));
  }
  // Check publish date
  if (req.query.publishAfter) {
    query = query.gte('publishDate', req.query.publishAfter);
  }
  if (req.query.publishBefore) {
    query = query.lte('publishDate', req.query.publishBefore);
  }
  try {
    const books = await query.exec();
    res.render("book/index", {
      books: books,
      searchOption: req.query
    });
  } catch {
    res.redirect('/');
  }
});

// New book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create book route
router.post("/new", upload.single("cover"), async (req, res) => {
  // Init Book
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  });
  // Save book
  try {
    const newBook = await book.save();
    // res.redirect(`book/${newBook.id}`);
    res.redirect("/book");
  } catch {
    if (book.coverImageName) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
});

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
  });
}

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

module.exports = router;