import { configDotenv } from "dotenv";
import express from "express";
import dotenv from "dotenv";
import "./DbConfigs/dbConfig.js";
import urlModel from "./Models/urlModel.js";
import urlRoute from "./Routes/urlRoute.js"
dotenv.config();

const app = express();
app.use(express.json());
app.use('/', urlRoute);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`the server started on the port ${port}`);
});
