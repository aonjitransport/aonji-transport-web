"use client";

import { useState } from "react";
import Header from "@/components/Header";

export default function TrackPage() {
  const [lr, setLr] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!lr) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/public/track?lr=${lr}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong");
      }

      setData(json);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const getStepIndex = (status: string) => {
    const steps = [
      "CREATED",
      "ADDED_TO_TRIP",
      "IN_TRANSIT",
      "ARRIVED_AT_BRANCH",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "POD_RECEIVED",
    ];

    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
      {/* HERO */}
      <div className="bg-[#1e3a8a] text-white py-16 px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Track Your Shipment</h1>
        <p className="text-sm opacity-90">
          Enter your LR number to get real-time updates
        </p>

        {/* SEARCH */}
        <div className="mt-6 flex justify-center gap-2">
          <input
            value={lr}
            onChange={(e) => setLr(e.target.value.toUpperCase())}
            placeholder="Enter LR Number (e.g. LR04260004)"
            className="px-4 py-3 rounded-lg w-80 text-black outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-white text-[#1e3a8a] px-5 py-3 rounded-lg font-semibold hover:bg-gray-200"
          >
            Track
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-6">
        {loading && <p className="text-center">Fetching details...</p>}

        {error && (
          <p className="text-center text-red-500 font-medium">{error}</p>
        )}

        {data && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                LR: {data.lrNumber}
              </h2>

              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                {data.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* ROUTE */}
            <p className="text-gray-600 mb-4">
              {data.from} → {data.to}
            </p>

            {/* TIMELINE */}
            <div className="relative mt-6">
              <div className="absolute left-4 top-0 w-1 h-full bg-gray-200" />

              {data.timeline.map((step: any, index: number) => {
                const active =
                  index <= getStepIndex(data.status);

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 mb-6 relative"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10
                        ${
                          active
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                    >
                      ✓
                    </div>

                    <div>
                      <p className="font-medium">
                        {step.status.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(step.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CURRENT LOCATION */}
            <div className="mt-4 text-sm text-gray-700">
              📍 Current Location: {data.currentLocation}
            </div>

            {/* POD */}
            {data.pod?.available && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Proof of Delivery</h3>

                <img
                  src={data.pod.url}
                  className="rounded-xl shadow max-h-96"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Verified at:{" "}
                  {new Date(data.pod.verifiedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}