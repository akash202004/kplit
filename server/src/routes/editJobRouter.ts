import { Router } from "express";
import { createEditJob } from "../controllers/videoController";
import { upload } from "../config/multer";

const router = Router();

router.post("/", upload.single("video"), createEditJob);

export default router;