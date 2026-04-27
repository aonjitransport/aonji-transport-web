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
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── FILE SELECT ── */
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

  /* ── CAMERA START ── */
  const startCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraOpen(false);
      setErrorMsg("Camera access denied");
    }
  };

  /* ── CAMERA STOP ── */
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setCameraOpen(false);
  };

  /* ── CAPTURE + AUTO CROP ── */
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const cropWidth = vw * 0.8;
    const cropHeight = vh * 0.6;
    const cropX = (vw - cropWidth) / 2;
    const cropY = (vh - cropHeight) / 2;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `pod-${Date.now()}.jpg`, { type: "image/jpeg" });
      setFiles((prev) => [...prev, file]);
    }, "image/jpeg", 0.9);

    stopCamera();
  };

  /* ── UPLOAD TO S3 ──
     ✅ url is returned from the server — never undefined on EC2
  ── */
  const uploadToS3 = async (file: File) => {
    const res = await fetch("/api/pod/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType: file.type }),
    });

    if (!res.ok) throw new Error("Failed to get presigned URL");

    const { presignedUrl, s3Key, url } = await res.json(); // ✅ url from server

    if (!presignedUrl || !s3Key || !url) throw new Error("Invalid presign response");

    // Upload directly to S3
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) throw new Error("S3 upload failed");

    return { s3Key, url }; // ✅ correct url — no NEXT_PUBLIC env needed
  };

  /* ── SUBMIT ──
     Groups all images into ONE pod submission (not one pod per image)
  ── */
  const handleSubmit = async () => {
    if (files.length === 0) {
      setErrorMsg("Please add at least one image");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Upload all files to S3 first
      const uploadedImages: { s3Key: string; url: string }[] = [];

      for (const file of files) {
        const result = await uploadToS3(file);
        uploadedImages.push(result);
      }

      // Submit all images as ONE pod
      const res = await fetch("/api/pod/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: uploadedImages,
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submit failed");
      }

      setSuccessMsg("POD submitted successfully! Admin will verify it.");
      setFiles([]);
      setNotes("");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Upload failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">Upload POD</h1>

      {/* SUCCESS */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✅ {successMsg}
        </div>
      )}

      {/* ERROR */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ❌ {errorMsg}
        </div>
      )}

      {/* FILE PICKER */}
      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
        <span className="text-gray-500 text-sm">Tap to add photos from gallery</span>
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
        className="flex items-center justify-center mt-3 gap-2 w-full bg-green-600 text-white p-3 rounded-lg font-medium"
      >
        <FaCamera />
        <span>Open Camera</span>
      </button>

      {/* PREVIEW GRID */}
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">{files.length} image(s) selected</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  onClick={() => setPreviewIndex(i)}
                  className="h-24 w-full object-cover rounded cursor-pointer"
                  alt={`preview-${i}`}
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
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
        placeholder="Notes (optional)"
        className="mt-3 w-full border p-2 rounded text-sm"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading || files.length === 0}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg font-medium transition"
      >
        {loading ? "Uploading..." : `Submit POD (${files.length} image${files.length !== 1 ? "s" : ""})`}
      </button>

      {/* FULLSCREEN PREVIEW */}
      {previewIndex !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <img
            src={URL.createObjectURL(files[previewIndex])}
            className="max-h-[90vh] max-w-[90vw] rounded"
            alt="fullscreen-preview"
          />
          <button
            onClick={() => setPreviewIndex(null)}
            className="absolute top-4 right-4 text-white text-2xl bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      {/* CAMERA OVERLAY */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black z-50">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Document guide box */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] h-[60%] border-4 border-white rounded-lg opacity-80" />
            <p className="absolute text-white text-xs opacity-60" style={{ top: "calc(50% + 31%)" }}>
              Align LR document inside the box
            </p>
          </div>

          {/* Camera buttons */}
          <div className="absolute bottom-8 w-full flex justify-center gap-6">
            <button
              onClick={capturePhoto}
              className="bg-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-white border-4 border-gray-400 rounded-full" />
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-6 py-3 rounded-full self-center"
            >
              Cancel
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}