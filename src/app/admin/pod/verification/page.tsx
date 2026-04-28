"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@mui/material";
import { usePodImage } from "../../hooks/usePodImage";

type OCRWord = {
  text: string;
  bbox: {
    Left: number;
    Top: number;
    Width: number;
    Height: number;
  };
};

export default function PodVerificationPage() {
  const [pods, setPods] = useState<any[]>([]);
  const [lrNumber, setLrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [words, setWords] = useState<OCRWord[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchPods();
  }, []);

  const fetchPods = async () => {
    const res = await fetch("/api/pod/verify");
    const text = await res.text();
    const data = text ? JSON.parse(text) : [];
    setPods(data);
  };

  const currentPod = pods[0];

  // Always prefer a fresh signed GET URL derived from the s3Key.
  // This avoids relying on any previously-stored public URLs (which may be wrong in prod)
  // and avoids requiring S3 CORS for <img crossOrigin="anonymous">.
  const currentS3Key: string | null = currentPod?.images?.[0]?.s3Key ?? null;
  const { url: signedImageUrl, error: signedImageError } = usePodImage(currentS3Key);

  useEffect(() => {
    if (!currentPod) return;

    // wait a bit for image to render
    const timer = setTimeout(() => {
      detectText();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPod]);

  /* 🔥 OCR FUNCTION */
  const detectText = async () => {
    if (!currentPod) return;

    setOcrLoading(true);

    try {
      const res = await fetch("/api/pod/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          s3Key: currentPod.images[0].s3Key,
        }),
      });

      const data = await res.json();

      const extractedWords =
        data?.map((w: any) => ({
          text: (w.text || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
          bbox: w.bbox,
        })) || [];

      const cleanedWords = extractedWords.filter((w: any) => w.text.length > 2);

      setWords(cleanedWords);

      // 🔥 AUTO LR DETECT
      const lrMatch = cleanedWords.find((w: any) => /^LR\d{5,}$/i.test(w.text));

      if (lrMatch) {
        setLrNumber(lrMatch.text);
      }
    } catch (err) {
      console.error("OCR ERROR:", err);
    }

    setOcrLoading(false);
  };

  const handleVerify = async () => {
    if (!currentPod || !lrNumber) return;

    setLoading(true);

    await fetch("/api/pod/verify", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        podId: currentPod._id,
        action: "VERIFY",
        linkedLRs: [{ lrNumber, imageIndex: 0 }],
      }),
    });

    setPods((prev) => prev.slice(1));
    setLrNumber("");
    setWords([]);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!currentPod) return;

    setLoading(true);
    
    await fetch("/api/pod/verify", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        podId: currentPod._id,
        action: "REJECT",
        rejectionReason: rejectionReason, 
        
      }),
    });

    setPods((prev) => prev.slice(1));
    setWords([]);
    setLoading(false);
    setRejectionReason("");
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">POD Verification</h1>
        <p className="font-semibold">Queue: {pods.length}</p>
      </div>

      {!currentPod ? (
        <p className="text-center mt-10 text-gray-500">No pending PODs 🎉</p>
      ) : (
        <div className="flex gap-4">
          {/* LEFT PANEL */}
          <div className="flex flex-col  w-80 border rounded p-4">
            

            <button
              onClick={detectText}
              className=" bg-blue-600   text-white w-full py-2 rounded mb-2"
            >
              {ocrLoading ? "Extracting..." : "Extract Text"}
            </button>

            <input
              ref={inputRef}
              value={lrNumber}
              onChange={(e) => setLrNumber(e.target.value)}
              placeholder="Click text to fill LR"
              className="border p-3 w-full mb-4 rounded"
            />

            <button
              onClick={handleVerify}
              className="bg-green-600 text-white w-full py-2 rounded mb-2"
            >
              {loading ? "Processing..." : "Approve"}
            </button>

            <button
              onClick={handleReject}
              className="bg-red-600 text-white w-full py-2 rounded mb-2"
            >
              Reject
            </button>

            <Input
              multiline
              className="p-0 border-0 focus:ring-0 focus:border-0 *:first-letter:first-line:marker:first-child:placeholder:invalid:focus:outline-none"   
              minRows={3} 
              value={rejectionReason || ""}  
              onChange={(e) => {
                setRejectionReason(e.target.value); 
               
              }}
              placeholder="Rejection reason (optional)"
              
            />  

            
            

           
            <div className="text-xs text-gray-500 mt-auto">
              <p className=" text-sm text-gray-600">
              Uploaded by: {currentPod.uploadedBy?.name}
            </p>
              at:{" "}
              {new Date(currentPod.createdAt).toLocaleString()}
            </div>  


          </div>

          {/* RIGHT PANEL */}
          {/* RIGHT PANEL */}
<div className="flex-1 border rounded p-4 relative">

  {/* 🔥 ZOOM CONTROLS */}
  <div className="absolute top-2 right-2 flex gap-2 z-20">
    <button
      onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
      className="bg-white border px-2 py-1 rounded shadow"
    >
      +
    </button>

    <button
      onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}
      className="bg-white border px-2 py-1 rounded shadow"
    >
      -
    </button>

    <button
      onClick={() => setZoom(1)}
      className="bg-white border px-2 py-1 rounded shadow"
    >
      Reset
    </button>
  </div>

  {/* 🔥 IMAGE SCROLL CONTAINER */}
  <div className="w-full h-[80vh] overflow-auto border rounded bg-gray-100 relative">
    
    {/* IMAGE WRAPPER */}
    <div
      className="relative inline-block"
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
    >
      <img
        ref={imgRef}
        src={signedImageUrl || undefined}
        className="max-h-[80vh] object-contain block"
        alt="POD"
      />

      {signedImageError && (
        <div className="absolute bottom-2 left-2 right-2 text-xs bg-white/90 border rounded p-2 text-red-700">
          {signedImageError}
        </div>
      )}

      {/* 🔥 OCR OVERLAY (ONLY WHEN ZOOM = 1) */}
      {zoom === 1 &&
        imgRef.current &&
        words.map((word, i) => {
          const img = imgRef.current!;

          const left = word.bbox.Left * img.clientWidth;
          const top = word.bbox.Top * img.clientHeight;
          const width = word.bbox.Width * img.clientWidth;
          const height = word.bbox.Height * img.clientHeight;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setLrNumber(word.text)}
              style={{
                position: "absolute",
                left,
                top,
                width,
                height,
                background:
                  hoveredIndex === i
                    ? "rgba(0,255,0,0.3)"
                    : "transparent",
                cursor: "pointer",
              }}
            />
          );
        })}
    </div>
  </div>
</div>



        </div>
      )}
    </div>
  );
}
