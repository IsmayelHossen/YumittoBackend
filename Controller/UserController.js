const express = require("express");
const UserRoute = express.Router();
const con = require("../Database/DbConnection");
const SqlExecuteFuncion = require("../Database/QueryExecute");
UserRoute.get("/data/:id", async function (req, res, next) {
  const sql = "select*from user";
  const result = await SqlExecuteFuncion(sql);
  console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
  //   con.query(sql, function (err, results, fields) {
  //     console.log(results); // results contains rows returned by server
  //     return res.status(200).json({
  //       success: true,
  //       data: results,
  //     });
  //   });
});
module.exports = UserRoute;
