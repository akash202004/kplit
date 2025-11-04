import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import prisma from "../prisma/client";
import { JobStatus, Prisma } from "@prisma/client";
import { parsePrompt } from "../services/llmParser";
import { processWithPython } from "../services/videoProcessor";
import { uploadToCloudinary } from "../services/cloudinaryUpload";
// import fs from "fs";

export const createEditJob = async (req: Request, res: Response) => {
  const requestId = randomUUID();
  let jobId: string | null = null;
  try {
    const prompt = req.body.prompt;
    const videoFile = req.file;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      console.warn(`[createEditJob] [${requestId}] Invalid or empty prompt`, {
        promptType: typeof prompt,
      });
      return res.status(400).json({ error: "Prompt is required" });
    }

    const normalizedPrompt = prompt.trim();

    console.info(`[createEditJob] [${requestId}] Received request`, {
      hasPrompt: typeof prompt === "string",
      promptPreview: normalizedPrompt.slice(0, 120),
      file: videoFile
        ? {
            originalName: videoFile.originalname,
            size: videoFile.size,
            mimetype: videoFile.mimetype,
            path: videoFile.path,
            filename: videoFile.filename,
          }
        : null,
    });

    if (!videoFile) {
      console.warn(`[createEditJob] [${requestId}] No video file uploaded`);
      return res.status(400).json({ error: "No video file uploaded" });
    }

    // Generate a job ID without database dependency
    jobId = randomUUID();

    console.info(`[createEditJob] [${requestId}] Created edit job`, {
      jobId: jobId,
      inputPath: videoFile.path,
    });

    // Try to create database record, but don't fail if database is unavailable
    try {
      await prisma.editJob.create({
        data: {
          id: jobId,
          inputUrl: videoFile.path,
          prompt: normalizedPrompt,
          status: JobStatus.PENDING,
        },
      });
      console.info(`[createEditJob] [${requestId}] Database record created`);
    } catch (dbError) {
      console.warn(
        `[createEditJob] [${requestId}] Database unavailable, continuing without persistence`,
        {
          error: dbError instanceof Error ? dbError.message : dbError,
        }
      );
    }

    let parsed;
    try {
      parsed = await parsePrompt(normalizedPrompt);
    } catch (parseError) {
      console.error(`[createEditJob] [${requestId}] Prompt parsing failed`, {
        jobId: jobId,
        error:
          parseError instanceof Error
            ? { message: parseError.message, stack: parseError.stack }
            : parseError,
      });
      throw new Error("Failed to parse edit instructions");
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as any).actions)
    ) {
      console.error(
        `[createEditJob] [${requestId}] Invalid parsed prompt format`,
        {
          jobId: jobId,
          parsed,
        }
      );
      throw new Error("Parsed prompt is in an invalid format");
    }

    const parsedCommand = parsed as { actions: unknown[] };

    console.info(`[createEditJob] [${requestId}] Parsed prompt`, {
      jobId: jobId,
      parsedCommand,
    });

    // Try to update database status, but don't fail if database is unavailable
    try {
      await prisma.editJob.update({
        where: {
          id: jobId,
        },
        data: {
          status: JobStatus.PROCESSING,
          parsedCommand: parsedCommand as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (dbError) {
      console.warn(
        `[createEditJob] [${requestId}] Could not update database status`,
        {
          error: dbError instanceof Error ? dbError.message : dbError,
        }
      );
    }

    console.info(`[createEditJob] [${requestId}] Job marked as PROCESSING`, {
      jobId: jobId,
    });

    const outputPath = await processWithPython(videoFile.path, parsedCommand);

    console.info(`[createEditJob] [${requestId}] Video processed via Python`, {
      jobId: jobId,
      outputPath,
    });

    const uploaded = await uploadToCloudinary(outputPath);

    console.info(
      `[createEditJob] [${requestId}] Uploaded processed video to Cloudinary`,
      {
        jobId: jobId,
        cloudinaryPublicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
      }
    );

    // fs.unlinkSync(videoFile.path);
    // fs.unlinkSync(outputPath);

    // Try to update database with completion status
    try {
      await prisma.editJob.update({
        where: {
          id: jobId,
        },
        data: {
          outputUrl: uploaded.secure_url,
          status: JobStatus.COMPLETED,
        },
      });
    } catch (dbError) {
      console.warn(
        `[createEditJob] [${requestId}] Could not update database completion status`,
        {
          error: dbError instanceof Error ? dbError.message : dbError,
        }
      );
    }

    console.info(`[createEditJob] [${requestId}] Job completed`, {
      jobId: jobId,
      outputUrl: uploaded.secure_url,
    });

    res.json({ success: true, jobId: jobId, outputUrl: uploaded.secure_url });
  } catch (error) {
    if (jobId) {
      try {
        await prisma.editJob.update({
          where: { id: jobId },
          data: { status: JobStatus.FAILED },
        });
      } catch (statusError) {
        console.warn(
          `[createEditJob] [${requestId}] Could not mark job as FAILED in database`,
          {
            jobId,
            error:
              statusError instanceof Error
                ? { message: statusError.message, stack: statusError.stack }
                : statusError,
          }
        );
      }
    }

    console.error(`[createEditJob] [${requestId}] Failed to create job`, {
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
    });
    const message =
      error instanceof Error ? error.message : "Failed to create job";
    res.status(500).json({ error: message, jobId });
  }
};
