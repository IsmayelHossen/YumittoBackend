const express = require("express");
const LoginRegisterRoute = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
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

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

//image upload functionality end

LoginRegisterRoute.post("/register", async function (req, res, next) {
  console.log(req.body);
  let { name, email, password, mobile } = req.body;
  const hasPassword = await bcrypt.hash(password, 10);
  const vcode = Math.floor(Math.random() * 10000);

  var mailOptions = {
    from: "<ismayelhossen124@gmail.com>",
    to: email,
    subject: "Yumitto Account Verification",
    text: "Plaintext version of the message",
    html: `<p>Verification Code:${vcode}</p>`,
  };

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      console.log("Email accpted: " + info.accepted);
      const sql = `INSERT INTO customers(name,email,mobile,password,vcode)
      VALUES('${name}','${email}','${mobile}','${hasPassword}','${vcode}')`;
      const result = await SqlExecuteFuncion(sql);

      return res.status(200).json({
        success: true,
      });
    }
  });
});

//confirm
LoginRegisterRoute.post("/confirm", async function (req, res, next) {
  const query = `SELECT*FROM customers WHERE vcode='${req.body.vcode}' `;
  const findverication_code = await SqlExecuteFuncion(query);
  //   console.log(findverication_code[0].vcode);
  if (
    findverication_code.length > 0 &&
    findverication_code[0].vcode == req.body.vcode
  ) {
    const query1 = `update customers set status='1' where vcode=${req.body.vcode} `;
    const findverication_code = await SqlExecuteFuncion(query1);
    res.status(200).json({
      success: true,
    });
  } else {
    res.status(201).json({
      success1: true,
    });
  }
});

//login

LoginRegisterRoute.post("/login", async function (req, res, next) {
  const query = `SELECT*FROM customers WHERE email='${req.body.email}' `;
  const findUser = await SqlExecuteFuncion(query);
  console.log(findUser);
  try {
    if (findUser && findUser.length > 0) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        findUser[0].password
      );
      console.log(isValidPassword);
      if (isValidPassword) {
        const token = jwt.sign(
          {
            name: findUser[0].name,
            Email: findUser[0].email,
          },
          process.env.JWT_TOKEN_SECRET,
          {
            expiresIn: 6000 * 30,
          }
        );
        res
          .status(200)
          // .cookie("access_token", "Bearer " + 778, {
          //   expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
          // })
          .json({
            success: true,
            access_token: token,
            message: "Login successfully",
            userdata: { email: findUser[0].email, name: findUser[0].name },
          });
      } else {
        res.status(200).json({
          Success1: true,
          message: "Authentication failed user password wrong",
        });
      }
    } else {
      res.status(200).json({
        Success1: true,
        message: "Authentication failed user not found",
      });
    }
  } catch {
    await res.status(401).json({
      error: "Authentication failed",
    });
  }
});

LoginRegisterRoute.get("/userData/:email", async function (req, res, next) {
  console.log(req.params.email);
  const sql = `SELECT name,email,address,city,region,mobile,thana from customers where email='${req.params.email}'`;
  const result = await SqlExecuteFuncion(sql);
  // console.log(result);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

LoginRegisterRoute.put(
  "/userdataUpdate/:email",
  async function (req, res, next) {
    console.log(req.params.email);
    let { name, email, address, city, region, mobile, thana } = req.body;
    const sql = `update customers set name='${name}',address='${address}',city='${city}',region='${region}',mobile='${mobile}',thana='${thana}'  where email='${req.params.email}'`;
    const result = await SqlExecuteFuncion(sql);
    // console.log(result);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);
module.exports = LoginRegisterRoute;
