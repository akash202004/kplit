import { useCallback, useRef } from "react";
import type { ChangeEvent, DragEvent, FC } from "react";

import { EDITOR_MEDIA_DRAG_DATA_KEY } from "../types";
import type { DroppedFile } from "../types";

type MediaPanelProps = {
  files: DroppedFile[];
  onFilesAdded: (fileList: FileList) => void;
  onSelectVideo: (url: string) => void;
};

const MediaPanel: FC<MediaPanelProps> = ({
  files,
  onFilesAdded,
  onSelectVideo,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (event.dataTransfer.files?.length) {
        onFilesAdded(event.dataTransfer.files);
        event.dataTransfer.clearData();
      }
    },
    [onFilesAdded]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleItemDragStart = useCallback(
    (event: DragEvent<HTMLElement>, file: DroppedFile) => {
      if (file.kind !== "video") return;

      event.dataTransfer.setData("text/plain", file.id);
      event.dataTransfer.setData(EDITOR_MEDIA_DRAG_DATA_KEY, file.id);
      event.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { files: selectedFiles } = event.target;

      if (selectedFiles?.length) {
        onFilesAdded(selectedFiles);
        event.target.value = "";
      }
    },
    [onFilesAdded]
  );

  return (
    <div className="flex h-full w-full flex-col border-r border-white/10 bg-[#0b0f15] md:min-w-[280px] md:max-w-[320px] lg:min-w-[320px] lg:max-w-[360px]">
      {/* <div className='flex items-center justify-between border-b border-white/5 px-6 py-4 text-sm text-zinc-200'>
        <div className='inline-flex items-center gap-2 rounded-lg bg-[#11161d] p-1 text-xs font-medium text-zinc-400'>
          <button className='rounded-md bg-gradient-to-b from-purple-500 to-purple-600 px-4 py-1.5 text-sm font-semibold text-black shadow-sm shadow-purple-900/50 transition hover:from-purple-400 hover:to-purple-500'>
            Import
          </button>
          <button className='rounded-md px-4 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white'>
            Record
          </button>
        </div>
        <div className='relative'>
          <input
            type='search'
            placeholder='Search project media'
            className='w-48 rounded-md border border-white/10 bg-[#090c12] px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/60 focus:outline-none'
          />
        </div>
      </div> */}
      <div
        className="flex-1 overflow-auto px-3 py-4 md:px-4 lg:px-6"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-purple-500/40 bg-[#11161d]/70 text-center text-sm text-zinc-400 shadow-inner shadow-purple-900/10 transition hover:border-purple-400 hover:bg-[#151c26] hover:text-white md:h-36 lg:h-40"
          onClick={handleBrowse}
        >
          <div className="rounded-full bg-purple-500/20 p-2 text-purple-400 md:p-2.5">
            ⭳
          </div>
          <div className="px-2">
            <p className="text-xs font-semibold text-white md:text-sm">
              Drop your video clips, images, or audio here
            </p>
            <p className="text-[10px] text-zinc-500 md:text-xs">
              Or click to browse from your computer
            </p>
          </div>
          <button className="rounded-md border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wide text-zinc-300 transition hover:border-purple-500/50 hover:text-white md:px-4 md:text-xs">
            Browse Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-3 md:mt-6 md:space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="uppercase tracking-[0.3em] text-[9px] text-zinc-500 md:text-[10px]">
                Project Assets
              </span>
              <span className="text-[10px] md:text-xs">
                {files.length} item
                {files.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="group rounded-lg border border-white/10 bg-[#0b0f15] p-2 transition-colors hover:border-purple-500/40 hover:bg-[#121922]"
                  draggable={file.kind === "video"}
                  onDragStart={(event) => handleItemDragStart(event, file)}
                >
                  <div className="mb-2 h-20 w-full overflow-hidden rounded-md border border-white/10 bg-black sm:h-24 md:h-28">
                    {file.kind === "image" ? (
                      <img
                        src={file.url}
                        alt={file.file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <button
                        draggable
                        className="grid h-full w-full place-items-center text-xs text-zinc-300 transition-colors group-hover:text-white md:text-sm"
                        onClick={() => onSelectVideo(file.url)}
                        onDragStart={(event) =>
                          handleItemDragStart(event, file)
                        }
                        title={file.file.name}
                      >
                        ▶
                      </button>
                    )}
                  </div>
                  <p className="truncate text-[10px] text-zinc-300 md:text-xs">
                    {file.file.name}
                  </p>
                  <p className="text-[9px] uppercase text-zinc-500 md:text-[10px]">
                    {(file.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default MediaPanel;
