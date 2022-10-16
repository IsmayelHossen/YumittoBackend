const express = require("express");
const jwt = require("jsonwebtoken");
const RouteCheckUsingJWT = (req, res, next) => {
  //console.log(req);
  const { authorization } = req.headers;
  try {
    const token = authorization.split(" ")[1];
    console.log
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    const { name, Email } = decoded;
    req.name = name;
    req.Email = Email;
    console.log(Email);
    console.log(name);
    next();
  } catch (error) {
    console.log(error);
    next("Token Not Valid ok");
  }
};
module.exports = RouteCheckUsingJWT;
