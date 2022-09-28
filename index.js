const express = require("express");
const app = express();

const port = 4000;
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");
const UserRoute = require("./Controller/UserController");
const ProductRoute = require("./Controller/ProductController");
const FrontendRoute = require("./Controller/FrontendController");
const LoginRegisterRoute = require("./Controller/LoginRegisterController");

app.use(express.json());
//parse upcoming data json format
app.use(cors());
app.options("*", cors());
//cors use for multile side use this properties
app.use(express.static("public"));
//public static se for static file show outside of this project
app.use(morgan("dev"));
app.use("/getuser/", UserRoute);
app.use("/products/", ProductRoute);
app.use("/frontend/", FrontendRoute);
app.use("/loginRegister", LoginRegisterRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
