require("dotenv").config();
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http");
// const session = require("express-session");
const morgan = require("morgan");
const { checkOverload } = require("./helpers/check.connect");
const app = express();
const server = http.createServer(app);


app.use(
  session({
    secret: "your-secret-key", // Thay thế bằng một chuỗi bất kỳ để mã hóa session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Nếu bạn chỉ sử dụng HTTPS, đặt là true
  })
);

// init middlewares
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // Địa chỉ của React app
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization,x-api-key",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.options("*", cors());

// init db

require("./dbs/init.mongodb");

//init redis
require("./redis/index")
// checkOverload()

// init routes
app.use("/", require("./routes"));

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;