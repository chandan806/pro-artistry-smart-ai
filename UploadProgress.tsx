"use client";

import { useEffect, useState } from "react";

interface UploadProgressProps {
  progress?: number;
  uploading?: boolean;
}

export default function UploadProgress({progress=0, uploading=false}: UploadProgressProps){
  const [currentProgress,setCurrentProgress]=useState(progress);
  useEffect(()=>{setCurrentProgress(progress)},[progress]);
  return (
    <div className="w-full max-w-xl mx-auto p-5 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-5">Upload Progress</h2>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-4 bg-blue-600 transition-all duration-300" style={{width:`${currentProgress}%`}} />
      </div>
      <div className="flex justify-between mt-3">
        <span>{uploading?"Uploading...":"Completed"}</span>
        <span>{currentProgress}%</span>
      </div>
    </div>
  );
}
