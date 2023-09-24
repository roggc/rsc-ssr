import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import { fillJSXWithClientComponents } from "../client/utils/index.js";
import Router from "./components/router.js";
import { renderJSXToClientJSX, stringifyJSX } from "./utils/index.js";
import React from "react";

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/favicon.ico", (req, res, next) => {
  res.end("");
});

app.use(async (req, res, next) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const clientJSX = await renderJSXToClientJSX(
      <Router url={url} body={req.body} />
    );
    const clientJSXString = JSON.stringify(clientJSX, stringifyJSX);
    if (url.pathname === "/") {
      const fixedJSX = await fillJSXWithClientComponents(clientJSX);
      const bootstrapScriptContent = `window.__INITIAL_CLIENT_JSX_STRING__ = ${clientJSXString};`;
      const { pipe } = renderToPipeableStream(fixedJSX, {
        bootstrapModules: ["src/client/index.js"],
        bootstrapScriptContent,
        onShellReady() {
          res.setHeader("content-type", "text/html");
          pipe(res);
        },
      });
    } else {
      res.setHeader("Content-Type", "application/json");
      res.end(clientJSXString);
    }
  } catch (err) {
    next(err);
  }
});

app.use(function (err, req, res) {
  console.error(err);
  res.status(err.status || 500);
  res.end();
});

const port = 8080;

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
