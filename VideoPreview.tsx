"use client";

import { useState } from "react";

export default function VideoPreview() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) return;
    setFileName(file.name);
    setVideoUrl(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Video Preview</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
      />

      {fileName && (
        <p className="mt-3 text-blue-600">{fileName}</p>
      )}

      {videoUrl && (
        <video
          controls
          className="mt-4 w-full rounded-lg border"
          src={videoUrl}
        />
      )}
    </div>
  );
}
