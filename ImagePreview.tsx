"use client";

import { useState } from "react";

export default function ImagePreview(){
  const [preview,setPreview]=useState<string|null>(null);

  const onChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    if(!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Image Preview</h2>
      <input type="file" accept="image/*" onChange={onChange}/>
      {preview && <img src={preview} alt="Preview" className="mt-4 w-full rounded-lg border" />}
    </div>
  );
}
