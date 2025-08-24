"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface UploadDropzoneProps {
  onText?: (text: string) => void;
  onFiles?: (files: File[]) => void;
  accept?: string;
}

export function UploadDropzone({ onText, onFiles, accept = ".txt,.csv,.md" }: UploadDropzoneProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function readFiles(files: FileList | null) {
    setErr(null);
    if (!files || files.length === 0) return;
    if (onFiles) {
      onFiles(Array.from(files));
      return;
    }
    if (onText) {
      const file = files[0];
      try {
        const text = await file.text();
        onText(text);
      } catch {
        setErr("Không thể đọc tệp đã chọn");
      }
    }
  }

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        readFiles(e.dataTransfer.files);
      }}
      onDragOver={(ev) => {
        ev.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      className={cn(
        "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        dragging ? "border-blue-500 bg-blue-50" : "border-slate-300"
      )}
    >
      <input
        ref={fileRef}
        type="file"
        multiple={Boolean(onFiles)}
        accept={accept}
        hidden
        onChange={(e) => readFiles(e.currentTarget.files)}
      />
      <p className="text-slate-700 mb-3">Chọn tệp của bạn hoặc kéo và thả</p>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        Chọn tệp
      </button>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}
