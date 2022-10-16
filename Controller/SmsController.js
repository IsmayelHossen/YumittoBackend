const express = require("express");
const SmsRoute = express.Router();
const bcrypt = require("bcrypt");
const SqlExecuteFuncion = require("../Database/QueryExecute");
const transporter = require("../Mail/Connection");
const RouteCheckUsingJWT = require("../Auth/CheckRoute");
const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: "5289a0d7",
  apiSecret: "xqQznVu8roGB2u8I",
});
SmsRoute.get("/sendmsms", async function (req, res, next) {
  const otp = Math.floor(Math.random(100, 100000) * 100);
  const from = "Yumitto(OTP)";
  const to = "8801323673048";
  const text = `This your mobile verification code`;

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]["status"] === "0") {
        // console.log("Message sent successfully.");
        res.status(200).json({
          success: true,
          OTP: otp,
        });
      } else {
        console.log(
          `Message failed with error: ${responseData.messages[0]["error-text"]}`
        );
      }
    }
  });
});
SmsRoute.get("/sendsms67867876", async function (req, res, next) {
  const sql = `SELECT image,name,email,address,city,region,mobile,thana from customers where email='${req.params.email}'`;
  const result = await SqlExecuteFuncion(sql);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = SmsRoute;
