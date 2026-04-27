"use client";
// src/app/admin/pod/upload/page.tsx

import { useState, useRef } from "react";
import { FaCamera } from "react-icons/fa6";

export default function PodUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* =========================
     FILE SELECT
  ========================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      newFiles.push(fileList[i]);
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* =========================
     CAMERA START
  ========================= */
  const startCamera = async () => {
    setCameraOpen(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  /* =========================
     CAMERA STOP
  ========================= */
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;

    stream?.getTracks().forEach((track) => track.stop());

    setCameraOpen(false);
  };

  /* =========================
     🔥 CAPTURE + AUTO CROP
  ========================= */
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // 🔥 Define crop area (same as overlay)
    const cropWidth = vw * 0.8;
    const cropHeight = vh * 0.6;

    const cropX = (vw - cropWidth) / 2;
    const cropY = (vh - cropHeight) / 2;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext("2d");

    ctx?.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `pod-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setFiles((prev) => [...prev, file]);
    }, "image/jpeg", 0.9);

    stopCamera();
  };

  /* =========================
     UPLOAD TO S3
  ========================= */
  const uploadToS3 = async (file: File) => {
    const res = await fetch("/api/pod/presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileType: file.type,
      }),
    });

    const { presignedUrl, s3Key } = await res.json();

    if (!s3Key) throw new Error("Missing s3Key");

    await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    return {
      s3Key,
      url: `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
    };
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("Images required");
      return;
    }

    setLoading(true);

    try {
      for (let file of files) {
        const result = await uploadToS3(file);

        await fetch("/api/pod/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images: [result],
            notes,
          }),
        });
      }

      alert("Uploaded successfully!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">Upload POD</h1>

      {/* FILE PICKER */}
      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
        <span className="text-gray-500">Tap to add photos</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* CAMERA BUTTON */}
      <button
        onClick={startCamera}
        className="flex items-center justify-center mt-3 gap-1 w-full bg-green-600 text-white p-3 rounded-lg"
      >
        <FaCamera className="" />
        <span className="">Open Camera</span>
      </button>

      {/* PREVIEW GRID */}
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">
            {files.length} image(s)
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  onClick={() => setPreviewIndex(i)}
                  className="h-24 w-full object-cover rounded cursor-pointer"
                />

                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white w-6 h-6 rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTES */}
      <input
        placeholder="Notes"
        className="mt-3 w-full border p-2 rounded"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg"
      >
        {loading ? "Uploading..." : "Submit POD"}
      </button>

      {/* FULLSCREEN PREVIEW */}
      {previewIndex !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <img
            src={URL.createObjectURL(files[previewIndex])}
            className="max-h-[90vh] max-w-[90vw]"
          />
          <button
            onClick={() => setPreviewIndex(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* 🔥 CAMERA OVERLAY */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black z-50">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* DOCUMENT BOX */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] h-[60%] border-4 border-white rounded-lg" />
          </div>

          {/* BUTTONS */}
          <div className="absolute bottom-6 w-full flex justify-center gap-4">
            <button
              onClick={capturePhoto}
              className="bg-white px-6 py-3 rounded-full"
            >
              Capture
            </button>

            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-6 py-3 rounded-full"
            >
              Close
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}