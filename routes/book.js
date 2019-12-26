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
    res.redirect(`book/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true);
  }
});

// Show book route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .exec();
    res.render("book/show", {
      book: book
    });
  } catch {
    res.redirect("/");
  }
});

// Edit book route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});

// Update book route
router.put("/:id", async (req, res) => {
  // Init Book
  let book;
  try {
    book = await book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`book/${newBook.id}`);
  } catch {
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      res.redirect("/");
    }
  }
});

router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect("/book");
  } catch {
    if (book != null) {
      res.render("book/show", {
        book: book,
        errorMessage: "Could not remove book"
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, `edit`, hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    // Nếu có lỗi
    if (hasError) params.errorMessage = "Error Creating Book";
    res.render(`book/${form}`, params);
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
