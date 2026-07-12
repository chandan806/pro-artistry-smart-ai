"use client";

import { useState } from "react";

export default function CameraUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-5">Camera Upload</h2>
      <input type="file" accept="image/*" capture="environment" onChange={handleCapture} />
      {fileName && <p className="mt-3 text-blue-600">{fileName}</p>}
      {image && <img src={image} alt="Preview" className="mt-5 rounded-lg border w-full" />}
    </div>
  );
}
