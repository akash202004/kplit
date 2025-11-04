import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { videoProcessor } from "../services/videoProcessor";
import { llmParser } from "../services/llmParser";

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only video files are allowed."));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Upload video endpoint
router.post(
  "/upload",
  upload.single("video"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded" });
      }

      const videoPath = req.file.path;
      const videoUrl = `/uploads/${req.file.filename}`;

      res.json({
        message: "Video uploaded successfully",
        filename: req.file.filename,
        path: videoPath,
        url: videoUrl,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload video" });
    }
  }
);

// AI-powered auto-edit endpoint
router.post("/ai-edit", async (req: Request, res: Response) => {
  try {
    const { videoUrl, filename } = req.body;

    if (!videoUrl || !filename) {
      return res
        .status(400)
        .json({ error: "Video URL and filename are required" });
    }

    // Extract video path from URL
    const videoPath = path.join(
      process.cwd(),
      "uploads",
      path.basename(videoUrl)
    );

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: "Video file not found" });
    }

    // Use LLM to analyze video and generate edit instructions
    const analysisPrompt = `Analyze this video file and suggest automatic edits. Consider:
    - Silence detection for cuts
    - Scene detection
    - Audio quality improvements
    - Basic color correction
    
    Return a JSON object with "actions" array containing edit instructions like:
    {
      "actions": [
        {"action": "cut_section", "start_time": 15, "end_time": 22},
        {"action": "brightness", "value": 1.2},
        {"action": "volume", "value": 1.5}
      ]
    }`;

    const aiResponse = await llmParser.parseEditInstructions(
      analysisPrompt,
      videoPath
    );

    res.json({
      message: "AI analysis complete",
      actions: aiResponse.actions || [],
      suggestions: aiResponse.suggestions || [],
    });
  } catch (error) {
    console.error("AI edit error:", error);
    res.status(500).json({ error: "Failed to analyze video with AI" });
  }
});

// Process video with edit actions
router.post("/process-video", async (req: Request, res: Response) => {
  try {
    const { videoUrl, filename, actions } = req.body;

    if (!videoUrl || !filename || !actions) {
      return res
        .status(400)
        .json({ error: "Video URL, filename, and actions are required" });
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      return res
        .status(400)
        .json({ error: "Actions must be a non-empty array" });
    }

    // Extract video path from URL
    const inputPath = path.join(
      process.cwd(),
      "uploads",
      path.basename(videoUrl)
    );

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: "Video file not found" });
    }

    // Generate output filename
    const outputFilename = `processed-${Date.now()}-${path.basename(filename)}`;
    const outputPath = path.join(process.cwd(), "uploads", outputFilename);

    // Process video with the provided actions
    await videoProcessor.processVideo(inputPath, outputPath, actions);

    const processedVideoUrl = `/uploads/${outputFilename}`;

    res.json({
      message: "Video processed successfully",
      processedVideoUrl,
      outputPath,
      actionsApplied: actions.length,
    });
  } catch (error) {
    console.error("Video processing error:", error);
    res.status(500).json({
      error: "Failed to process video",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get video info endpoint
router.get("/info/:filename", async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: "Video file not found" });
    }

    const videoInfo = await videoProcessor.getVideoInfo(videoPath);

    res.json({
      filename,
      ...videoInfo,
    });
  } catch (error) {
    console.error("Video info error:", error);
    res.status(500).json({ error: "Failed to get video information" });
  }
});

export default router;
