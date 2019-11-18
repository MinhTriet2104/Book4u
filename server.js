// Add env var
if (process.env.NODE_ENV !== "production") {
  require("dotenv/config");
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");

// Connect db
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    keepAlive: 6600000,
    connectTimeoutMS: 6600000,
    socketTimeoutMS: 6600000,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Mongo connected successfull");
  })
  .catch(err => {
    console.log("Mongo connected error:", err);
  });

// View setup
app.set("view engine", "ejs"); // Chọn view engine
app.set("views", __dirname + "/views"); // Chứa các file view
app.set("layout", "layouts/layout"); // Chứa các header footer

// Middlewares
app.use(expressLayouts); // Sửa dụng express layouts
app.use(express.static("public")); // Nơi chứa public/css, js, img, uploads

// Body parser
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb"
  })
);
app.use(express.json({ extended: true, limit: "50mb" }));

// Router
const indexRouter = require("./routes/index");
const authorRouter = require("./routes/author");
const bookRouter = require("./routes/book");

// PORT
app.listen(process.env.PORT || 3000);

// Routes
app.use("/", indexRouter);
app.use("/author", authorRouter);
app.use("/book", bookRouter);
