const express = require("express");
const SSLCommerzPayment = require("sslcommerz-lts");
const cors = require("cors");
const PaymentRoute = express.Router();
const bcrypt = require("bcrypt");
const con = require("../Database/DbConnection");
const SqlExecuteFuncion = require("../Database/QueryExecute");
const transporter = require("../Mail/Connection");
const is_live = false;

PaymentRoute.get("/init", async function (req, res, next) {
  console.log("init ami");
  console.log(req.body);
  const data = {
    total_amount: 100,
    currency: "BDT",
    tran_id: "REF123", // use unique tran_id for each api call
    success_url: "http://localhost:4000/payment/success",
    fail_url: "http://localhost:3030/fail",
    cancel_url: "http://localhost:3030/cancel",
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "Courier",
    product_name: "Computer.",
    product_category: "Electronic",
    product_profile: "general",
    cus_name: "Customer Name",
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };
  const sslcz = new SSLCommerzPayment(
    process.env.SSL_STORE_ID,
    process.env.SSL_STORE_PASSWORD,
    is_live
  );
  sslcz.init(data).then((apiResponse) => {
    // Redirect the user to payment gateway
    let GatewayPageURL = apiResponse.GatewayPageURL;
    //  console.log(apiResponse);
    res.redirect(apiResponse?.GatewayPageURL);
    console.log("Redirecting to: ", GatewayPageURL);
    // console.log(apiResponse);
  });
});
PaymentRoute.post("/success", async function (req, res, next) {
  // return res.status(200).json({
  //   //success: true,
  //   data: req.body,
  // });
  res.redirect("http://localhost:3000/home/orderconfirm/9226");
});
PaymentRoute.post("/fail", async function (req, res, next) {});
PaymentRoute.post("/cancel", async function (req, res, next) {});
PaymentRoute.post("/ipn", async function (req, res, next) {});
module.exports = PaymentRoute;
