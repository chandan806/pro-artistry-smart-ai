"use client";

import { useRef, useState } from "react";

export default function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="p-6 border rounded-xl bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Upload File</h2>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white"
      >
        Choose File
      </button>

      {fileName && (
        <p className="mt-4 text-green-600">
          Selected: {fileName}
        </p>
      )}
    </div>
  );
}
