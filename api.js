/* Imports */
require("dotenv").config();
const {
  getFoldersAndFiles,
  makeRecursive,
  insertAll,
  check,
  deleteItems,
  download,
  upload,
  login,
  purge,
} = require("./controllers/actioner");
const methodOverride = require("method-override");
const { extended, method } = require("./config");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { getFile, getRecursiveDown, getRecursiveUp } = require("./services/file.service");
const app = express();

/* Configuration */
app.use(bodyParser.urlencoded(extended));
app.use(methodOverride(method));
app.use(express.json());
app.use(fileupload());
app.use(cors());

/* GETs */
app.get("/", getFoldersAndFiles);
app.get("/recursive", makeRecursive);
app.get("/download", download);
app.get("/check", check);
app.get("/test", async (req, res) => {
  const conditions = {
    idParent: 10
  };
  const files = await getRecursiveUp(conditions);
  console.log(files);
});

/* POSTs */
app.post("/", upload);
app.post("/login", login);
app.post("/purge", purge);
app.post("/recursive/all", insertAll);

/* DELETEs */
app.delete("/", deleteItems);

/* LISTEN */
app.listen(process.env.PORT, (err) => {
  if (err) console.log(err);
  console.log("API Desplegada:", `http://localhost:${process.env.PORT}`);
});
