const express = require("express");
const UserRoute = express.Router();
const bcrypt = require("bcrypt");
const SqlExecuteFuncion = require("../Database/QueryExecute");
const transporter = require("../Mail/Connection");
const RouteCheckUsingJWT = require("../Auth/CheckRoute");

UserRoute.get(
  "/orderData/:email",
  RouteCheckUsingJWT,
  async function (req, res, next) {
    const sql = `select*from orders where email_phone='${req.params.email}'`;
    const result = await SqlExecuteFuncion(sql);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);
UserRoute.get(
  "/order/details/:orderid",
  RouteCheckUsingJWT,
  async function (req, res, next) {
    //  const sql = `select*from cart where orderid='${req.params.orderid}'`;
    const sql = `Select cart.*,orders.* from cart inner join orders on cart.orderid=orders.cart_orderid where orderid='${req.params.orderid}'`;
    const result = await SqlExecuteFuncion(sql);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);
UserRoute.get(
  "/order/shippingBillingAddress/:email",
  RouteCheckUsingJWT,
  async function (req, res, next) {
    const sql = `SELECT image,name,email,address,city,region,mobile,thana from customers where email='${req.params.email}'`;
    const result = await SqlExecuteFuncion(sql);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);
UserRoute.post("/changepassword", async function (req, res, next) {
  const query = `SELECT*FROM customers WHERE email='${req.body.email}' `;
  const findUser = await SqlExecuteFuncion(query);

  try {
    if (findUser && findUser.length > 0) {
      const isValidPassword = await bcrypt.compare(
        req.body.oldpassword,
        findUser[0].password
      );
      console.log(isValidPassword);
      if (isValidPassword) {
        const vcode = Math.floor(Math.random() * 10000);
        var mailOptions = {
          from: "<ismayelhossen124@gmail.com>",
          to: req.body.email,
          subject: "Yumitto Account Password Change Verification code",
          text: "Plaintext version of the message",
          html: `<p>Verification Code:${vcode}</p>`,
        };
        transporter.sendMail(mailOptions, async function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
            console.log("Email accpted: " + info.accepted);
            const sql = `UPDATE customers set pvcode='${vcode}',temppassword='${req.body.newpassword}' where email='${req.body.email}'`;
            const result = await SqlExecuteFuncion(sql);

            return res.status(200).json({
              success: true,
            });
          }
        });
      } else {
        res.status(200).json({
          passwordwrong: true,
        });
      }
    }
  } catch {
    console.log("error");
  }
});
UserRoute.post("/confirmchangeasswordcode", async function (req, res, next) {
  const query = `SELECT*FROM customers WHERE pvcode='${req.body.vcode}' `;
  const findverication_code = await SqlExecuteFuncion(query);
  console.log(findverication_code[0].pvcode);
  if (
    findverication_code.length > 0 &&
    findverication_code[0].pvcode == req.body.vcode
  ) {
    const hasPassword = await bcrypt.hash(
      findverication_code[0].temppassword,
      10
    );
    const query1 = `update customers set password='${hasPassword}' where pvcode=${req.body.vcode} `;
    const findverication_code99 = await SqlExecuteFuncion(query1);
    res.status(200).json({
      success: true,
    });
  } else {
    res.status(201).json({
      success1: true,
    });
  }
});

module.exports = UserRoute;
