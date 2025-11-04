# Recutz

Recutz is a human-in-the-loop video editing platform that turns a short natural-language brief into production-ready cuts. It pairs a cinematic-first React client, a resilient TypeScript orchestration backend, and a Python/FFmpeg execution engine that keeps audio, timing, and metadata intact through multi-step edits. The result is an end-to-end workflow that helps editors iterate quickly without surrendering control to a black-box AI.

## Why This Isn’t Just Another “AI Wrapper”
- **Structured reasoning, not prompts-in/prompts-out** – edit requests are parsed into a deterministic action graph (trim, crop, gamma, etc.) before any processing happens, so every decision is inspectable and replayable.
- **Deterministic FFmpeg pipeline** – a FastAPI engine composes dozens of handcrafted filters (brightness, blur, speed, cut-section, audio preservation) and stitches intermediate renders, ensuring reproducible output with audit logs.
- **Job lifecycle management** – the Node/Express service stores jobs in Postgres via Prisma, gracefully degrades when the database is down, and survives restarts with resumable job IDs.
- **Round-trippable media state** – the client rehydrates edited outputs, converts them back into File objects, and chains subsequent requests so the AI builds on the latest version instead of re-processing the original clip.
- **Operational safeguards** – Cloudinary distribution, API key handshakes between services, ffprobe validation, and progressive clean-up keep the system ready for production workloads.

## Platform Architecture
- **Client (`client/`)** – Vite + React 19 single-page app featuring drag-and-drop media, a live assistant thread, timeline visualization, and playback of every iteration.
- **Application Server (`server/`)** – Express + TypeScript service that accepts uploads via Multer, calls OpenAI for structured instruction parsing, persists job metadata with Prisma, orchestrates the Python engine, and publishes final assets to Cloudinary.
- **Video Engine (`Engine_video/`)** – FastAPI app that receives JSON action plans, issues a controlled chain of FFmpeg operations, and verifies audio/video integrity before streaming the finished file back.

```mermaid
flowchart LR
  UI[React Client] -->|FormData prompt + video| API[Express Server]
  API -->|LLM JSON plan| OpenAI[(OpenAI GPT-4o-mini)]
  API -->|Actions + media| Engine[FastAPI FFmpeg Engine]
  Engine -->|Processed file| API
  API -->|Upload| Cloudinary[(Cloudinary)]
  API -->|Status + URLs| UI
  API -->|Job history| Postgres[(PostgreSQL via Prisma)]
```

## Core Capabilities
- **Conversational editor** with assistant messages, error surfacing, and revision history tracking.
- **Timeline building blocks** (waveform preview, clip stacking) to keep creative context while offloading heavy edits.
- **LLM-guided instruction parsing** that maps free-form instructions to a controlled action schema with presets for cinematic, social, or repair workflows.
- **Audio-aware FFmpeg recipes** that validate tracks after every step and warn when a filter might remove channels.
- **Cloud delivery** via automatic Cloudinary uploads and signed URLs the UI can download or replay immediately.

## Tech Stack
- Front-end: React 19, Vite, Tailwind, Framer Motion.
- Backend: Node 20+, Express, Prisma, Multer, OpenAI SDK, Cloudinary SDK.
- Video engine: Python 3.11+, FastAPI, ffmpeg-python, native FFmpeg/FFprobe.
- Storage & services: PostgreSQL, Cloudinary.

## Prerequisites
- Node.js v20 or later and npm.
- Python 3.11 or later.
- FFmpeg/FFprobe available on the `PATH` (or set `FFMPEG_PATH`).
- PostgreSQL database (local or hosted) for Prisma migrations.
- Cloudinary account for video hosting.

## Environment Variables

Create a `.env` in each service (examples shown below).

### Server (`server/.env`)
```
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/videosure"
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ENGINE_URL=http://localhost:8000
# Optional overrides
PYTHON_BACKEND=http://localhost:8000/process
PYTHON_BACKEND_API_KEY=your-secure-api-key-123
API_KEY=your-secure-api-key-123
```

### Video Engine (`Engine_video/.env`)
```
API_KEY=your-secure-api-key-123
HOST=0.0.0.0
PORT=8000
INPUT_DIR=uploads
OUTPUT_DIR=outputs
FFMPEG_TIMEOUT=300
FFMPEG_PATH=C:/ffmpeg/bin/ffmpeg.exe   # optional
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:3000
```

## Getting Started

1. **Install dependencies**
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install

   # Video engine
   cd ../Engine_video
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Run database migrations** (from `server/`)
   ```bash
   npx prisma migrate deploy
   ```

3. **Start the services**
   ```bash
   # Terminal 1 – Python engine
   cd Engine_video
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2 – Node server
   cd server
   npm run dev

   # Terminal 3 – React client
   cd client
   npm run dev
   ```

4. Open `http://localhost:5173` (default Vite port) and upload a clip to begin.

## Processing Lifecycle
1. **Upload** – the client collects a file + natural language prompt and posts a multipart job to `/api/jobs`.
2. **Parse** – the server validates input, stores a `PENDING` job, and converts the prompt into a JSON action list using OpenAI with a strict schema.
3. **Transform** – actions are sent to the Python engine, which executes each step using FFmpeg primitives, verifying audio after every render.
4. **Publish** – the finished video is uploaded to Cloudinary, job status is updated to `COMPLETED`, and the client receives the secure URL.
5. **Iterate** – the client hydrates the edited file into a `File` object so subsequent prompts continue from the latest version.

If anything fails, the job is marked `FAILED`, and the assistant reports the actionable error back to the user.

## Deployment Notes
- Package the server and engine separately; they communicate over HTTPS with an optional API key header.
- Configure FFmpeg via `FFMPEG_PATH` in containerized deployments.
- Use Cloudinary upload presets for further transformations or signed delivery URLs.
- Prisma migrations target PostgreSQL; adjust the datasource in `schema.prisma` for other providers.

## Troubleshooting
- **Missing FFmpeg** – the engine logs a detailed installation hint if the binary is absent.
- **LLM parsing errors** – prompts that don’t produce the expected JSON will surface as a 500; inspect server logs to see the raw response and adjust instructions or presets.
- **Database offline** – the server warns but continues processing, so you can still demo end-to-end edits without persistence.
- **Large files** – tune Multer limits and FastAPI body-size configuration if you expect multi-gig uploads.

## Roadmap Ideas
- Background job queue for long-running renders.
- Webhook callbacks and progress polling for clients.
- Additional FFmpeg recipes (color grading LUTs, caption overlay, AI upscaling hooks).

---

VideoSure lets editors focus on storytelling while the stack handles parsing, rendering, and delivery with production rigor.

