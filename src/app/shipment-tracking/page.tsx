"use client";
//app/shipment-tracking/page.tsx
import { useState } from "react";
import Header from "@/components/Header";
import shipmenttrackimage from "../../../public/assets/trakpageimgvec.png";
import Image from "next/image";
import {
  FaBox,
  FaTag,
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaImage,
  FaDownload,
  FaEye,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

export default function TrackPage() {
  const [lr, setLr] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [podOverlay, setPodOverlay] = useState(false);

  const handleSearch = async () => {
    if (!lr) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/public/track?lr=${lr}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setData(json);
      console.log(data);
      console.log(json);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const STEPS = [
    "CREATED",
    "ADDED_TO_TRIP",
    "IN_TRANSIT",
    "ARRIVED_AT_BRANCH",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "POD_RECEIVED",
  ];

  const getStepIndex = (status: string) => STEPS.indexOf(status);

  // Filter timeline to only show steps after CREATED
  const getDisplayTimeline = (timeline: any[]) =>
    timeline.filter((s) => s.status !== "CREATED");

 const handleDownload = (url: string, filename: string) => {
  const proxyUrl = `/api/public/download-pod?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  const link = document.createElement("a");
  link.href = proxyUrl;
  link.download = filename;
  link.click();
};

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-IN"),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="min-h-[calc(100vh-62px)] grid md:grid-cols-2 items-center px-6 md:px-12 lg:px-20 py-10 gap-8 overflow-hidden">
        {/* LEFT */}
        <div className="flex flex-col justify-center max-w-lg">
          <h1 className="font-bebas font-bold text-5xl md:text-6xl lg:text-7xl text-indigo-900 tracking-wide leading-tight">
            Track Your Shipment
          </h1>
          <p className="font-roboto text-gray-500 text-base md:text-lg mt-3 mb-8 leading-relaxed">
            Enter your LR number below to track
            <br />
            your shipment in real-time.
          </p>

          <div className="flex items-center gap-3">
            <input
              value={lr}
              onChange={(e) => setLr(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter LR Number (e.g. LR04260004)"
              className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 shadow-sm text-gray-800 font-roboto text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-700 hover:bg-blue-800 text-white font-roboto font-semibold px-6 py-3.5 rounded-xl shadow-md transition-colors whitespace-nowrap"
            >
              Track
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-blue-700 font-roboto text-sm mt-6">
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Fetching shipment details...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 font-roboto text-sm px-4 py-3 rounded-xl mt-6">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — illustration or result card */}
        <div className="hidden md:flex justify-center items-start h-full py-4">
          {!data ? (
            <div className="relative w-full h-[520px]">
              <Image
                src={shipmenttrackimage}
                alt="Track Shipment Illustration"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-h-[calc(100vh-100px)] overflow-y-auto">
              {/* ── CARD HEADER ── */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaBox className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="font-roboto font-extrabold text-gray-900 text-xl leading-tight">
                      LR: {data.lrNumber}
                    </h2>
                    <p className="font-roboto text-sm text-gray-500 mt-0.5">
                      {data.from} → {data.to}
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-lg text-xs font-bold border border-blue-200 text-blue-700 bg-blue-50 font-roboto tracking-wide whitespace-nowrap">
                  {data.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* ── HORIZONTAL TIMELINE ── */}
              {/* ── HORIZONTAL TIMELINE ── */}
              <div className="mt-6 mb-6 overflow-x-auto">
                <div className="min-w-max">
                  {/* Steps row */}
                  <div className="flex items-center">
                    {STEPS.filter((s) => s !== "CREATED").map(
                      (stepStatus, index, arr) => {
                        const active =
                          STEPS.indexOf(stepStatus) <=
                          getStepIndex(data.status);
                        const nextActive =
                          index < arr.length - 1 &&
                          STEPS.indexOf(arr[index + 1]) <=
                            getStepIndex(data.status);
                        const isLast = index === arr.length - 1;
                        return (
                          <div key={stepStatus} className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
              ${active ? "bg-green-500" : "bg-gray-200"}`}
                            >
                              {active ? (
                                <FaCheckCircle className="text-white text-base" />
                              ) : (
                                <span className="text-gray-400 text-xs font-bold">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            {!isLast && (
                              <div
                                className={`h-0.5 w-16 ${nextActive ? "bg-green-500" : "bg-gray-200"}`}
                              />
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* Labels row */}
                  <div className="flex items-start mt-2">
                    {STEPS.filter((s) => s !== "CREATED").map(
                      (stepStatus, index, arr) => {
                        const active =
                          STEPS.indexOf(stepStatus) <=
                          getStepIndex(data.status);
                        const isLast = index === arr.length - 1;
                        // Look up date from actual timeline if it exists
                        const entry = data.timeline.find(
                          (t: any) => t.status === stepStatus,
                        );
                        const formatted = entry ? formatDate(entry.date) : null;
                        return (
                          <div key={stepStatus} className="flex items-start">
                            <div className="w-8 flex flex-col items-center">
                              <p
                                className={`font-roboto font-bold text-[9px] text-center leading-tight mt-1
                ${active ? "text-gray-800" : "text-gray-400"}`}
                              >
                                {stepStatus.replace(/_/g, " ")}
                              </p>
                              {formatted ? (
                                <>
                                  <p className="font-roboto text-[8px] text-gray-400 text-center mt-0.5">
                                    {formatted.date}
                                  </p>
                                  <p className="font-roboto text-[8px] text-gray-400 text-center">
                                    {formatted.time}
                                  </p>
                                </>
                              ) : (
                                <p className="font-roboto text-[8px] text-gray-300 text-center mt-0.5">
                                  —
                                </p>
                              )}
                            </div>
                            {!isLast && <div className="w-16 flex-shrink-0" />}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* ── CURRENT LOCATION ── */}
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 mb-5">
                <FaMapMarkerAlt className="text-blue-500 text-lg flex-shrink-0" />
                <span className="font-roboto text-sm text-gray-600">
                  Current Location:{" "}
                  <span className="font-bold text-blue-700">
                    {data.currentLocation}
                  </span>
                </span>
              </div>

              {/* ── BOTTOM: details + POD side by side ── */}
              <div className="grid grid-cols-2 gap-4">
                {/* Shipment Details */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-roboto font-bold text-gray-900 text-sm">
                      Shipment Details
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        icon: <FaTag className="text-blue-500 text-xs" />,
                        label: "LR Number",
                        value: data.lrNumber,
                      },
                      {
                        icon: <FaBuilding className="text-blue-500 text-xs" />,
                        label: "From",
                        value: data.from,
                      },
                      {
                        icon: <FaBuilding className="text-blue-500 text-xs" />,
                        label: "To",
                        value: data.to,
                      },
                      {
                        icon: (
                          <FaCalendarAlt className="text-blue-500 text-xs" />
                        ),
                        label: "Shipment Date",
                        value: data.timeline?.[0]?.date
                          ? new Date(data.timeline[0].date).toLocaleDateString(
                              "en-IN",
                            )
                          : "—",
                      },
                    ].map(({ icon, label, value }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 text-gray-500">
                            {icon}
                            <span className="font-roboto text-xs">{label}</span>
                          </div>
                          <span className="font-roboto text-xs font-semibold text-gray-800 text-right max-w-[120px] truncate">
                            {value}
                          </span>
                        </div>
                        <div className="h-px bg-gray-100" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proof of Delivery */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FaImage className="text-blue-600 text-sm" />
                    </div>
                    <h3 className="font-roboto font-bold text-gray-900 text-sm">
                      Proof of Delivery
                    </h3>
                  </div>

                  {data.pod?.available ? (
                    <div className="border border-gray-100 rounded-xl p-3">
                      {/* POD thumbnail — click to view full */}
                      <div
                        className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group mb-3"
                        onClick={() => setPodOverlay(true)}
                      >
                        <img
                          src={data.pod.url}
                          alt="POD"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-roboto text-xs font-semibold">
                            Click to view full
                          </span>
                        </div>
                      </div>

                      {/* File info */}
                      <p className="font-roboto font-semibold text-gray-800 text-xs truncate">
                        POD_{data.lrNumber}.jpg
                      </p>
                      <p className="font-roboto text-gray-400 text-[10px] mt-0.5">
                        Uploaded on{" "}
                        {new Date(data.pod.verifiedAt).toLocaleString("en-IN")}
                      </p>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() =>
                            handleDownload(
                              data.pod.url,
                              `POD_${data.lrNumber}.jpg`,
                            )
                          }
                          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-roboto font-semibold text-xs py-2 rounded-lg transition-colors"
                        >
                          <FaDownload className="text-xs" />
                          Download
                        </button>
                        <button
                          onClick={() => setPodOverlay(true)}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-roboto font-semibold text-xs py-2 rounded-lg transition-colors"
                        >
                          <FaEye className="text-blue-500 text-xs" />
                          View
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                      <FaImage className="text-4xl mb-2" />
                      <p className="font-roboto text-xs text-gray-400">
                        No POD uploaded yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── POD FULL SCREEN OVERLAY ── */}
      {podOverlay && data?.pod?.available && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPodOverlay(false)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPodOverlay(false)}
              className="absolute -top-4 -right-4 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-700 text-sm" />
            </button>

            <img
              src={data.pod.url}
              alt="Proof of Delivery"
              className="w-full rounded-2xl shadow-2xl max-h-[85vh] object-contain"
            />

            <div className="flex justify-center mt-4">
              <button
                onClick={() =>
                  handleDownload(data.pod.url, `POD_${data.lrNumber}.jpg`)
                }
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-roboto font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
              >
                <FaDownload />
                Download POD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
