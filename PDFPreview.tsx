"use client";

import { useState } from "react";

export default function PDFPreview() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return;
    setFileName(file.name);
    setPdfUrl(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">PDF Preview</h2>

      <input type="file" accept="application/pdf" onChange={handleChange} />

      {fileName && <p className="mt-3 text-blue-600">{fileName}</p>}

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          title="PDF Preview"
          className="mt-4 w-full h-[600px] rounded-lg border"
        />
      )}
    </div>
  );
}
