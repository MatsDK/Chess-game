require("dotenv").config();
import express from "express";
import cors from "cors";
import "./socket";
import { apiRouter } from "./apiRouter";

const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors({ origin: process.env.WEB_URL }));
app.use("/api", apiRouter);

app.listen(PORT, () => console.log(`>> Server listening on localhost:${PORT}`));
