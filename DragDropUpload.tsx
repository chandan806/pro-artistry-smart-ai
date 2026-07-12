"use client";

import { useState } from "react";

export default function DragDropUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
          dragging ? "border-blue-600 bg-blue-50" : "border-gray-300"
        }`}
      >
        <h2 className="text-2xl font-bold mb-3">Drag & Drop Upload</h2>
        <p>Drag files here or click below</p>

        <input
          type="file"
          multiple
          accept="*/*"
          className="mt-5"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="mt-6 space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex justify-between border rounded-lg p-3">
            <span>{file.name}</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        ))}
      </div>
    </div>
  );
}
