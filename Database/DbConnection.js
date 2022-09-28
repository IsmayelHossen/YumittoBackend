// var mysql = require("mysql");
const mysql = require("mysql2");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "yumitto",
});
module.exports = con;
