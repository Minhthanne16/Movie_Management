import React, { useCallback, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";

interface PosterUploaderProps {
  value: string;
  onChange: (posterUrl: string) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export default function PosterUploader({ value, onChange }: PosterUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadFile(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-tickify-pink bg-tickify-pink/10"
            : "border-white/15 bg-white/3 hover:border-tickify-pink/40 hover:bg-white/5"
        }`}
      >
        {value ? (
          <div className="flex flex-col items-stretch gap-0 sm:flex-row sm:items-stretch">
            <div className="relative aspect-2/3 w-full max-w-[140px] shrink-0 bg-black/40">
              <img
                src={value}
                alt="Poster preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <Upload className="text-tickify-cyan" size={28} />
              <p className="text-xs font-bold text-gray-400">
                Kéo thả ảnh mới vào đây hoặc bấm để chọn
              </p>
              <p className="text-[10px] text-gray-600">JPG, PNG, WebP, GIF</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
            <div className="rounded-2xl bg-tickify-pink/15 p-4">
              <ImagePlus className="text-tickify-pink" size={32} />
            </div>
            <p className="text-sm font-bold text-white">Tải poster phim</p>
            <p className="text-xs text-gray-500">
              Kéo thả file vào vùng này hoặc bấm để chọn từ máy
            </p>
          </div>
        )}
      </button>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Hoặc dán URL poster
        </label>
        <input
          type="url"
          placeholder="https://..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-tickify-pink"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
