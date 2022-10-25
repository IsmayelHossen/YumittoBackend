const express = require("express");
const FrontendRoute = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const SqlExecuteFuncion = require("../Database/QueryExecute");

//image upload functionality start
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/upolads/products/");
  },
  filename: (req, file, cb) => {
    const fileext = path.extname(file.originalname);
    console.log(fileext);
    const filename =
      file.originalname.replace(fileext, "").toLowerCase() + "-" + Date.now();
    cb(null, filename + fileext);
  },
});
const upload = multer({
  //  limits: { fileSize: 2000000000 },
  fileFilter: (req, file, cb) => {
    console.log(req.file);
    if (file.fieldname == "img") {
      if (
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg"
      ) {
        cb(null, true);
      } else {
        cb(new Error("only jpg,png,jpeg format are available"));
      }
    } else if (file.fieldname == "pdf") {
      console.log(file);
      if (
        file.mimetype == "application/pdf" ||
        file.mimetype ==
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        cb(null, true);
      } else {
        cb(new Error("only pdf are available"));
      }
    } else {
      cb(new Error("unknown error"));
    }
  },
  storage: storage,
});
const uploadImage = upload.fields([{ name: "img", maxCount: 10 }]);

//image upload functionality end

FrontendRoute.get("/productData/get/:id", async function (req, res, next) {
  const sql = `SELECT distinct products.*,images.* from products inner join images 
  on products.id=images.products_id where products.subsubcategories_id=${req.params.id}`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

// main search
FrontendRoute.get(
  "/searchproductData/get/:mainsearch",
  async function (req, res, next) {
    const sql = `SELECT distinct products.*,images.* from products inner join images 
  on products.id=images.products_id where products.title like '%${req.params.mainsearch}%' OR products.price like '%${req.params.mainsearch}%'
  OR products.brand like '%${req.params.mainsearch}%' `;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);

FrontendRoute.get(
  "/subsubcategory/search/:id/:searchd",
  async function (req, res, next) {
    //   const sql = `SELECT  products.*,images.* from products join images
    // on products.id=images.products_id where products.subsubcategories_id=${req.params.id} AND products.title like '%${req.params.searchd}%' or products.price like '%${req.params.searchd}%' `;
    const sql = `SELECT  products.*,images.* from products join images 
  on products.id=images.products_id where products.subsubcategories_id=${req.params.id} AND products.title like '%${req.params.searchd}%' or products.price like '%${req.params.searchd}%' `;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);

FrontendRoute.get(
  "/filtereddata/get/:id/:filter",
  async function (req, res, next) {
    if (req.params.filter == "high") {
      console.log(req.params.filter);
      const sql = `SELECT distinct products.*,images.* from products inner join images 
    on products.id=images.products_id where products.subsubcategories_id=${req.params.id} order by products.price desc`;
      const result = await SqlExecuteFuncion(sql);
      // console.log(result);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else if (req.params.filter == "low") {
      const sql = `SELECT distinct products.*,images.* from products inner join images 
    on products.id=images.products_id where products.subsubcategories_id=${req.params.id} order by products.price asc`;
      const result = await SqlExecuteFuncion(sql);
      // console.log(result);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      const sql = `SELECT distinct products.*,images.* from products inner join images 
    on products.id=images.products_id where products.subsubcategories_id=${req.params.id}`;
      const result = await SqlExecuteFuncion(sql);
      // console.log(result);
      return res.status(200).json({
        success: true,
        data: result,
      });
    }
  }
);

FrontendRoute.get(
  "/singleProductData/get/:productId",
  async function (req, res, next) {
    console.log(req.params.productId);
    // const sql = `SELECT products.*,images.* from products inner join images
    // on products.id=images.products_id where products.id=${req.params.productId}`;

    const sql = `SELECT categories.*,subcategories.*,subsubcategories.*,products.*,images.*  from ((((categories
    inner join subcategories on categories.id=subcategories.category_id)
    inner join subsubcategories on subcategories.id=subsubcategories.subcategory_id)
    inner join products on subsubcategories.id=products.subsubcategories_id)
    inner join images on products.id=images.products_id) where products.id=${req.params.productId}
  `;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);

FrontendRoute.post("/cartDatasave", async function (req, res, next) {
  console.log(req.body);

  req.body.map(async (row, index) => {
    const sql = `INSERT INTO cart(name,cname,subname,subsubname,model,quantity,price,coupon,coupon_discount,design_color_code,pound,orderid,cakewishname,UserCouponTrue,shipping)
  VALUES('${row.name}','${row.cname}','${row.subname}','${row.subsubname}','${row.model}','${row.quantity}','${row.price}','${row.coupon}','${row.coupon_discount}','${row.design_color_code}','${row.pound}','${row.orderid}','${row.cakewishname}','${row.couponCode}','${row.shipping}')`;
    const result = await SqlExecuteFuncion(sql);
  });
  return res.status(200).json({
    success: true,
  });
});
FrontendRoute.post("/orderConfirm", async function (req, res, next) {
  console.log(req.body);
  let { pay_number, pay_trxid, orderid, email, total_amount } = req.body;
  const time_date = new Date().toLocaleString();
  let month = new Date().toLocaleString("default", { month: "long" });
  let year = new Date().getFullYear();
  const month_year = month + " " + year;
  const sql = `INSERT INTO orders(payment_method,payment_number,payment_txid,cart_orderid,timedate,email_phone,total_amount,month_year)
  VALUES('Bkash','${pay_number}','${pay_trxid}','${orderid}','${time_date}','${email}','${total_amount}','${month_year}')`;
  const result = await SqlExecuteFuncion(sql);
  return res.status(200).json({
    success: true,
  });
});
FrontendRoute.post("/register", async function (req, res, next) {
  console.log(req.body);
  let { name, email, password, mobile } = req.body;
  const hasPassword = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO customers(name,email,mobile,password)
  VALUES('${name}','${email}','${mobile}','${hasPassword}')`;
  const result = await SqlExecuteFuncion(sql);
  return res.status(200).json({
    success: true,
  });
});

FrontendRoute.post("/reviews", async function (req, res, next) {
  console.log(req.body);
  let { name, email, product_id, subsubcategories_id, review, star } = req.body;
  const time_date = new Date().toLocaleString();
  review = review.replace(/\'/g, " '' ");
  const sql = `INSERT INTO  reviwes(name,email,product_id,subsubcategory_id,msg,timedate,star)
  VALUES('${name}','${email}','${product_id}','${subsubcategories_id}','${review}','${time_date}','${star}')`;
  const result = await SqlExecuteFuncion(sql);
  return res.status(200).json({
    success: true,
  });
});

FrontendRoute.get(
  "/singleProductDataReviws/get/:productId",
  async function (req, res, next) {
    console.log(req.params.productId);
    // const sql = `SELECT products.*,images.* from products inner join images
    // on products.id=images.products_id where products.id=${req.params.productId}`;

    const sql = `SELECT*from reviwes
     where product_id=${req.params.productId}
  `;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);

module.exports = FrontendRoute;
