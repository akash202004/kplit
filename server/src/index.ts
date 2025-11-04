import dotenv from "dotenv";
dotenv.config(); // load env FIRST ✅

import express from "express";
import cors from "cors";
import editJobRoutes from "./routes/editJobRouter";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/jobs", editJobRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
