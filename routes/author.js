const express = require("express");
const router = express.Router();
const Author = require("../models/Author");

// All author route
router.get("/", async (req, res) => {
  let searchOption = {};
  if (req.query.search) {
    searchOption.name = new RegExp(req.query.search, "i");
  }
  try {
    const authors = await Author.find(searchOption);
    res.render("author/index", {
      authors: authors,
      searchOption: req.query
    });
  } catch {
    res.redirect("/");
  }
});

// New author route
router.get("/new", (req, res) => {
  res.render("author/new", {
    author: new Author()
  });
});

// Create author route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name
  });

  try {
    const newAuthor = await author.save();
    // res.redirect(`author/${newAuthor.id}`);
    res.redirect("/author");
  } catch {
    res.render("author/new", {
      author: author,
      errorMessage: "Error creating author"
    });
  }

  // author.save((err, newAuthor) => {
  //   if (err) {
  //     res.render("author/new", {
  //       author: author,
  //       errorMessage: "Error creating author"
  //     });
  //   } else {
  //     // res.redirect(`author/${newAuthor.id}`);
  //     res.redirect("author");
  //   }
  // });
});

module.exports = router;