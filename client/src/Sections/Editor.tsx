import { useCallback, useMemo, useState } from "react";

import AssistantPanel from "./Editor/components/AssistantPanel";
import MediaPanel from "./Editor/components/MediaPanel";
import PreviewPanel from "./Editor/components/PreviewPanel";
import TimelinePanel from "./Editor/components/TimelinePanel";
import { useEditorMedia } from "./Editor/hooks/useEditorMedia";
import type {
  AssistantMessage,
  DroppedFile,
  TimelineClip,
} from "./Editor/types";
import { createEditJob } from "../services/editJobs";

const TIMELINE_TICKS = Array.from({ length: 13 }, (_, index) => index * 5);

const WAVEFORM = Array.from({ length: 160 }, (_, index) => {
  const sine = Math.sin(index / 7) * 35;
  const cosine = Math.cos(index / 11) * 20;
  return Math.max(12, Math.min(95, Math.round(40 + sine + cosine)));
});

const WELCOME_MESSAGE: AssistantMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Upload a clip in the media panel and describe the edit you need. I will send it to the AI pipeline and report back with progress.",
};

const CLIP_DURATION_SECONDS = 8;

const Editor = () => {
  const { files, activeVideoUrl, addFiles, setActiveVideoUrl } =
    useEditorMedia();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    WELCOME_MESSAGE,
  ]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null); // Track current video file
  const [editHistory, setEditHistory] = useState<string[]>([]); // Track edit URLs

  const defaultVideoId = useMemo(
    () => files.find((file) => file.kind === "video")?.id ?? null,
    [files]
  );

  const handleFilesAdded = useCallback(
    (fileList: FileList) => {
      setAssistantError(null);
      addFiles(fileList);
      // Reset edit history when new file is uploaded
      if (fileList.length > 0) {
        setCurrentVideoFile(fileList[0]);
        setEditHistory([]);
      }
    },
    [addFiles]
  );

  const handleSelectVideo = useCallback(
    (url: string) => {
      setActiveVideoUrl(url);
    },
    [setActiveVideoUrl]
  );

  const handleDropClip = useCallback(
    (fileId: string) => {
      const file = files.find((item) => item.id === fileId);
      if (!file) return;

      setTimelineClips((current) => {
        const nextStart = current.reduce(
          (latestEnd, clip) => Math.max(latestEnd, clip.start + clip.duration),
          0
        );
        const newClip: TimelineClip = {
          id: `clip-${file.id}-${Date.now()}`,
          fileId: file.id,
          name: file.file.name,
          start: nextStart,
          duration: CLIP_DURATION_SECONDS,
          url: file.url,
        };
        return [...current, newClip];
      });

      setActiveVideoUrl(file.url);
    },
    [files, setActiveVideoUrl]
  );

  const handleAssistantSubmit = useCallback(
    async ({
      prompt,
      videoFile,
    }: {
      prompt: string;
      videoFile: DroppedFile;
    }) => {
      const timestamp = Date.now();
      const userMessage: AssistantMessage = {
        id: `user-${timestamp}`,
        role: "user",
        content: prompt,
      };

      setMessages((current) => [...current, userMessage]);
      setIsProcessing(true);
      setAssistantError(null);

      try {
        // Use the current video file (which gets updated with each edit) if available, otherwise use original
        const videoToEdit = currentVideoFile || videoFile.file;

        console.log(
          `Using video for edit: ${videoToEdit.name} (${videoToEdit.size} bytes)`
        );
        console.log(`Edit history length: ${editHistory.length}`);
        console.log(
          `Current video file: ${
            currentVideoFile ? currentVideoFile.name : "null"
          }`
        );
        console.log(`Original video file: ${videoFile.file.name}`);

        const result = await createEditJob({ prompt, video: videoToEdit });

        if (result.outputUrl) {
          setActiveVideoUrl(result.outputUrl);
          setEditHistory((prev) => [...prev, result.outputUrl!]);

          // Update the current video file to be the edited version for future edits
          try {
            const editedResponse = await fetch(result.outputUrl);
            if (editedResponse.ok) {
              const blob = await editedResponse.blob();
              const editedFileName = `edited_v${editHistory.length + 1}_${
                videoFile.file.name
              }`;
              setCurrentVideoFile(
                new File([blob], editedFileName, {
                  type: videoFile.file.type,
                })
              );
              console.log(`Updated current video file to: ${editedFileName}`);
            }
          } catch (error) {
            console.warn("Could not update current video file:", error);
          }
        }

        const assistantText = result.outputUrl
          ? `✨ Edit complete! ${
              editHistory.length > 0
                ? `(Version ${editHistory.length + 1})`
                : "(Version 1)"
            } Download your clip here: ${result.outputUrl}`
          : `✅ Edit request sent. Track job ${result.jobId} for the processed video.`;

        const assistantMessage: AssistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantText,
        };

        setMessages((current) => [...current, assistantMessage]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to submit edit request";
        setAssistantError(message);

        const assistantMessage: AssistantMessage = {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${message}`,
        };

        setMessages((current) => [...current, assistantMessage]);
      } finally {
        setIsProcessing(false);
      }
    },
    [setActiveVideoUrl, editHistory, currentVideoFile]
  );

  return (
    <div className="flex h-screen flex-col bg-[#05070b] text-white">
      <div className="flex flex-1 overflow-hidden">
        <MediaPanel
          files={files}
          onFilesAdded={handleFilesAdded}
          onSelectVideo={handleSelectVideo}
        />
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#080b11]">
          <PreviewPanel
            activeVideoUrl={activeVideoUrl}
            isProcessing={isProcessing}
          />
          <TimelinePanel
            timelineTicks={TIMELINE_TICKS}
            waveform={WAVEFORM}
            clips={timelineClips}
            onDropClip={handleDropClip}
          />
        </div>
        <AssistantPanel
          messages={messages}
          videoFiles={files}
          defaultVideoId={defaultVideoId}
          isProcessing={isProcessing}
          error={assistantError}
          onSubmit={handleAssistantSubmit}
        />
      </div>
    </div>
  );
};

export default Editor;
