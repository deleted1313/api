import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import initializeDb from "./db";
import middleware from "./middleware";
import api from "./api";
import config from "./config.json";
import { jsonDb, changeJson } from "./jsonDb.js";
import fs from "fs";
import path from "path";
let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan("dev"));

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.corsHeaders
  })
);
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// connect to db
initializeDb(db => {
  // internal middleware
  app.use(middleware({ config, db }));

  // api router
  app.use("/api", api({ config, db }));
  app.get("/success", function(req, res) {
    res.send(jsonDb.success);
  });
  app.get("/label", function(req, res) {
    res.send(jsonDb.data.label);
  });
  app.get("/reasons", function(req, res) {
    res.send(jsonDb.data.reasons);
  });

  app.get("/current_session", (req, res) => {
    res.send(jsonDb.data.current_session);
  });

  app.put("/set_current_session", (req, res) => {
    const obj = jsonDb; //now it an object

    // console.log(JSON.parse(jsonString), obj);
    const newObj = {
      ...obj,
      data: {
        ...obj.data,
        current_session: {
          ...req.body
        }
      }
    };
    changeJson(newObj);

    res.sendStatus(200);
  });
  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
});

export default app;
