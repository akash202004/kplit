import type { FC } from "react";

type PreviewPanelProps = {
  activeVideoUrl: string | null;
  isProcessing?: boolean;
};

const PreviewPanel: FC<PreviewPanelProps> = ({
  activeVideoUrl,
  isProcessing = false,
}) => (
  <aside className="flex flex-1 min-h-0 min-w-[420px] flex-col bg-[#0a0d14]">
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3 text-sm text-zinc-300">
      <span className="font-semibold text-white">Preview</span>
      <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
        1/2
      </span>
    </div>
    <div className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6">
      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-lg shadow-purple-900/20">
        {isProcessing ? (
          <div className="grid h-full min-h-[220px] place-items-center rounded-lg bg-gradient-to-br from-black/70 to-purple-900/20 p-6 text-center text-sm text-zinc-300">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500/20 border-t-purple-500"></div>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium text-white">Processing Video...</p>
                <p className="mt-1 text-xs text-zinc-400">
                  AI is applying your edits
                </p>
                <div className="mt-3 flex justify-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-purple-400 animate-pulse [animation-delay:0ms]"></div>
                  <div className="h-1 w-1 rounded-full bg-purple-400 animate-pulse [animation-delay:150ms]"></div>
                  <div className="h-1 w-1 rounded-full bg-purple-400 animate-pulse [animation-delay:300ms]"></div>
                </div>
              </div>
            </div>
          </div>
        ) : activeVideoUrl ? (
          <video
            src={activeVideoUrl}
            controls
            className="aspect-video w-full max-h-[380px] rounded-lg bg-black"
          />
        ) : (
          <div className="grid h-full min-h-[220px] place-items-center rounded-lg bg-black/70 p-6 text-center text-sm text-zinc-500">
            Select a video from your media library to preview.
          </div>
        )}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0d121b] px-4 py-3 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <button className="rounded border border-white/10 px-2 py-1 transition-colors hover:border-white/40 hover:text-white">
            ⟲
          </button>
          <button className="rounded-full border border-white/10 px-3 py-1 transition-colors hover:border-white/40 hover:text-white">
            ▶
          </button>
          <button className="rounded border border-white/10 px-2 py-1 transition-colors hover:border-white/40 hover:text-white">
            ⟳
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-300">
          <span className="tracking-wide">00:00:00:00</span>
          <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">
            Fit
          </span>
        </div>
      </div>
    </div>
  </aside>
);

export default PreviewPanel;
