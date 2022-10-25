const express = require("express");
const ProductRoute = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const SqlExecuteFuncion = require("../Database/QueryExecute");
const transporter = require("../Mail/Connection");
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

ProductRoute.post("/category/add", async function (req, res, next) {
  const { categoryName } = req.body;
  const sql = `INSERT INTO categories(cname) VALUES('${categoryName}')`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.get("/category/get", async function (req, res, next) {
  const { categoryName } = req.body;
  const sql = `SELECT*FROM categories`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
ProductRoute.put("/category/update/:id", async function (req, res, next) {
  const id = req.params.id;
  const { categoryName } = req.body;
  const sql = `UPDATE categories SET cname='${categoryName}' WHERE id=${id}`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.delete("/category/delete/:id", async function (req, res, next) {
  const id = req.params.id;
  const sql = `DELETE FROM categories  WHERE id=${id}`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.get("/category/search/:type", async function (req, res, next) {
  const type = req.params.type;
  const sql = `SELECT* FROM categories WHERE cname LIKE '%${type}%'`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

//sub category

ProductRoute.post("/subcategory/add", async function (req, res, next) {
  const { subcategoryName, category_id } = req.body;
  const sql = `INSERT INTO subcategories(subname,category_id) VALUES('${subcategoryName}','${category_id}')`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.get("/subcategory/get", async function (req, res, next) {
  const { categoryName } = req.body;
  const sql = `SELECT categories.*,subcategories.* from categories join subcategories on categories.id=subcategories.category_id`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
ProductRoute.put("/subcategory/update/:id", async function (req, res, next) {
  const id = req.params.id;
  const { categoryId, subcategoryName } = req.body;
  const sql = `UPDATE subcategories SET subname='${subcategoryName}',category_id=${categoryId} WHERE id=${id}`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.delete("/subcategory/delete/:id", async function (req, res, next) {
  const id = req.params.id;
  const sql = `DELETE FROM subcategories  WHERE id=${id}`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.get("/subcategory/search/:type", async function (req, res, next) {
  const type = req.params.type;
  const sql = `SELECT categories.cname,subcategories.subname from categories join 
  subcategories on categories.id=subcategories.category_id  WHERE categories.cname LIKE '%${type}% ' OR subcategories.subname LIKE '%${type}%'  `;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
//sub sub category
ProductRoute.post("/subsubcategory/add", async function (req, res, next) {
  //  console.log(res);
  uploadImage(req, res, async function (err) {
    if (err) {
      return res.status(200).send({ status: 400, message: err.message });
    }

    const { subsubcategoryName, subcategoryId } = req.body;
    const sql = `INSERT INTO subsubcategories(subsubname,subcategory_Id,image) VALUES('${subsubcategoryName}','${subcategoryId}','${req.files.img[0].filename}')`;
    const result = await SqlExecuteFuncion(sql);

    console.log(result);
    return res.status(200).json({
      success: true,
    });
  });
});
// ProductRoute.post("/subsubcategory/add", async function (req, res, next) {
//   const { subsubcategoryName, subcategoryId } = req.body;
//   const sql = `INSERT INTO subsubcategories(subsubname,subcategory_Id) VALUES('${subsubcategoryName}','${subcategoryId}')`;
//   const result = await SqlExecuteFuncion(sql);
//   // console.log(result);
//   return res.status(200).json({
//     success: true,
//   });
// });
ProductRoute.get("/subsubcategory/get", async function (req, res, next) {
  const { categoryName } = req.body;
  const sql = `SELECT categories.*,subcategories.*,subsubcategories.* from ((categories
   inner join subcategories on categories.id=subcategories.category_id)
   inner join subsubcategories on subcategories.id=subsubcategories.subcategory_id);
  
   
   `;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

ProductRoute.put("/subsubcategory/update/:id", async function (req, res, next) {
  const id = req.params.id;
  const { categoryId, subcategoryId, subsubcategoryName } = req.body;
  const sql = `UPDATE subsubcategories SET subsubname='${subsubcategoryName}',subcategory_id=${subcategoryId} WHERE id=${id}`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.delete(
  "/subsubcategory/delete/:id/:imagename",
  async function (req, res, next) {
    const id = req.params.id;
    const sql = `DELETE FROM subsubcategories  WHERE id=${id}`;
    const result = await SqlExecuteFuncion(sql);
    const filepath = `public/upolads/products/${req.params.imagename}`;

    await fs.unlink(filepath, () => {
      res.status(200).json({
        success: true,
        message: "Deleted data suceessfully",
      });
    });
  }
);
ProductRoute.get(
  "/subsubcategory/search/:type",
  async function (req, res, next) {
    const type = req.params.type;
    const sql = `SELECT categories.*,subcategories.*,subsubcategories.*  from ((categories
      inner join subcategories on categories.id=subcategories.category_id)
      inner join subsubcategories on subcategories.id=subsubcategories.subcategory_id)
  WHERE categories.cname LIKE '%${type}%' OR subcategories.subname LIKE '%${type}%' OR subsubcategories.subsubname LIKE '%${type}%'  `;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);

//add product

ProductRoute.post(
  "/product/add",

  async function (req, res, next) {
    //  console.log(res);
    uploadImage(req, res, async function (err) {
      if (err) {
        return res.status(200).send({ status: 400, message: err.message });
      }

      console.log(req.body);
      let {
        title,
        brand,
        model,
        price,
        pdiscount,
        after_discount_price,
        quantity,
        weight,
        coupon,
        coupon_discount,
        subsubcategoryId,
      } = req.body;
      const details = req.body.details.replace(/\'/g, " '' ");
      const sql = `INSERT INTO products(title,brand,model,price,quantity,weight,pdiscount,after_discount_price,coupon,coupon_discount,details,subsubcategories_id ) 
      VALUES('${title}','${brand}','${model}','${price}','${quantity}','${weight}','${pdiscount}','${after_discount_price}','${coupon}','${coupon_discount}','${details}','${subsubcategoryId}')`;
      const result = await SqlExecuteFuncion(sql);

      const query12 = "SELECT max(ID) as id FROM products";
      const result2 = await SqlExecuteFuncion(query12);
      const product_id = result2[0].id;

      if (req.files.img.length > 0) {
        var design_color = Math.floor(Math.random() * 20000);
        for (let i = 0; i < req.files.img.length; i++) {
          console.log(req.files.img[i].filename);

          const time_date = new Date().toLocaleString();
          const queryimg = `INSERT INTO  images(imgname,products_id ,filesize,timedate,design_color_code)
            VALUES('${req.files.img[i].filename}','${product_id}','${
            req.files.img[i].size
          }','${time_date}','${++design_color}')
              `;
          const result2 = await SqlExecuteFuncion(queryimg);
        }
      }

      console.log(result);
      return res.status(200).json({
        success: true,
      });
    });
  }
);

ProductRoute.get("/product/get", async function (req, res, next) {
  // const sql = `SELECT categories.*,subcategories.*,subsubcategories.*,products.*,images.*  from ((((categories
  //   inner join subcategories on categories.id=subcategories.category_id)
  //   inner join subsubcategories on subcategories.id=subsubcategories.subcategory_id)
  //   inner join products on subsubcategories.id=products.subsubcategories_id)
  //   inner join images on products.id=images.products_id)
  // `;
  const sql = `SELECT categories.*,subcategories.*,subsubcategories.*,products.*  from (((categories
    inner join subcategories on categories.id=subcategories.category_id)
    inner join subsubcategories on subcategories.id=subsubcategories.subcategory_id)
    inner join products on subsubcategories.id=products.subsubcategories_id)
    
  `;

  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

ProductRoute.delete("/product/delete/:id", async function (req, res, next) {
  const id = req.params.id;
  const sql = `DELETE FROM products  WHERE id=${id}`;
  const result = await SqlExecuteFuncion(sql);
  res.status(200).json({
    success: true,
    message: "Deleted data suceessfully",
  });
});

ProductRoute.get("/singleproduct/get/:id", async function (req, res, next) {
  const sql = `SELECT products.*,images.*  from products
    inner join images on products.id=images.products_id where products.id=${req.params.id}
  `;

  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
ProductRoute.post("/productColor/add", async function (req, res, next) {
  const { colorname, product_id } = req.body;
  const sql = `INSERT INTO colors(colorname,products_id) VALUES('${colorname}','${product_id}')`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});

ProductRoute.get(
  "/singleproductcolor/get/:id",
  async function (req, res, next) {
    const sql = `SELECT* from colors where products_id=${req.params.id}
  `;

    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);
ProductRoute.delete("/color/delete/:id", async function (req, res, next) {
  const id = req.params.id;
  const sql = `DELETE FROM colors  WHERE id=${id}`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
  });
});
ProductRoute.delete(
  "/image/delete/:id/:imgname",
  async function (req, res, next) {
    const id = req.params.id;
    const sql = `DELETE FROM images  WHERE id=${id}`;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    const filepath = `public/upolads/products/${req.params.imgname}`;

    await fs.unlink(filepath, () => {
      res.status(200).json({
        success: true,
        message: "Deleted data suceessfully",
      });
    });
  }
);
ProductRoute.get("/orders/get", async function (req, res, next) {
  const sql = `SELECT* from orders where status=0`;

  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
ProductRoute.get("/confirmorders/get", async function (req, res, next) {
  const sql = `SELECT* from orders where status=1`;

  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

ProductRoute.get(
  "/orders/details/get/:orderid",
  async function (req, res, next) {
    const sql = `SELECT cart.*,orders.* from cart inner join orders on cart.orderid=orders.cart_orderid where orders.cart_orderid=${req.params.orderid} `;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);
ProductRoute.get("/order/confirm/:orderid", async function (req, res, next) {
  // const toEmail = `SELECT*FROM orders where cart_orderid='${req.params.orderid}'`;
  // const result = await SqlExecuteFuncion(toEmail);
  // console.log(result[0].email_phone);
  // const emaito = result[0].email_phone;

  // const htmlPlaintext = <></>;

  // var mailOptions = {
  //   from: "<ismayelhossen124@gmail.com>",
  //   to: emaito,
  //   subject: "Yumitto Order Confirmed",
  //   text: "Plaintext version of the message",
  //   html: `<p class="btn btn-success">Order Confirmed</p>`,
  // };
  // transporter.sendMail(mailOptions, async function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Email sent: " + info.response);
  //     console.log("Email accpted: " + info.accepted);

  //     const sql = `update orders set status=1 where cart_orderid=${req.params.orderid} `;

  //     const result = await SqlExecuteFuncion(sql);
  //     // console.log(result);
  //     return res.status(200).json({
  //       success: true,
  //       data: result,
  //     });
  //   }
  // });

  const sql = `update orders set status=1 where cart_orderid=${req.params.orderid} `;

  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
ProductRoute.get("/countorder/get", async function (req, res, next) {
  const sql = `select*from orders where not status=1 `;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
ProductRoute.get("/councustomer/get", async function (req, res, next) {
  const sql = `select*from customers where status=1 `;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
ProductRoute.get("/customer/get/:orderid", async function (req, res, next) {
  const sql = `select*from orders where cart_orderid=${req.params.orderid} `;
  const result = await SqlExecuteFuncion(sql);
  console.log(result[0].email_phone);
  const email = result[0].email_phone;
  const sql2 = `select*from customers where email='${email}' `;
  const result2 = await SqlExecuteFuncion(sql2);
  console.log(result2);
  return res.status(200).json({
    success: true,
    data: result2,
  });
});
module.exports = ProductRoute;
