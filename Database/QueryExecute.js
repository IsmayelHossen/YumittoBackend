const con = require("../Database/DbConnection");
const SqlExecuteFuncion = async (sql) => {
  //   var sql = "SELECT a from b where info = data";
  const results = await con.promise().query(sql);
  // console.log(results[0]);
  return results[0];
};
module.exports = SqlExecuteFuncion;
