const express = require("express");

const logger = require("morgan");

const cookieParser = require("cookie-parser");

const cors = require("cors");

const FRONTEND_URL = process.env.ORIGIN || "http://localhost:5173";

module.exports = (app) => {
  // Because this is a server that will accept requests from outside and it will be hosted ona server with a `proxy`, express needs to know that it should trust that setting.
  // Services like heroku use something called a proxy and you need to add this to your server
  app.set("trust proxy", 1);

  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:5173", FRONTEND_URL],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  // Manually handle preflight OPTIONS requests for all routes
  app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);  // Dynamically allow the requesting origin
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(204);  // Send 204 No Content status for preflight checks
  });
  
  app.use(logger("dev"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
};