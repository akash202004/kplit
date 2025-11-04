-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "EditJob" (
    "id" TEXT NOT NULL,
    "inputUrl" TEXT NOT NULL,
    "outputUrl" TEXT,
    "prompt" TEXT NOT NULL,
    "parsedCommand" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "EditJob_pkey" PRIMARY KEY ("id")
);
