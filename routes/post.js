const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("We are on POST");
});

router.get("/specific", (req, res) => {
  res.send("Specific POST");
});

router.post("/", (req, res) => {
  console.log(req.body);
});

module.exports = router;
