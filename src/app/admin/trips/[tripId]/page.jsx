// src/app/admin/trips/[tripId]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useParams } from "next/navigation";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useBillPermissions } from "../hooks/useBillPermissions";
import { useTripPermissions } from "../hooks/useTripPermissions";

import {
  MdOutlineCreate,
  MdLocalShipping,
  MdLocationOn,
  MdCheckCircle,
} from "react-icons/md";

import { ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

/* ─────────────────────────────────────────
   Bill row action cell — needs tripStatus
───────────────────────────────────────── */
const BillActionCell = ({ data, userBranchId, tripStatus, onStatusUpdate }) => {
  const { allowedStatuses, isDisabled } = useBillPermissions(
    data,
    userBranchId,
    tripStatus, // ✅ pass trip status so permissions are trip-aware
  );

  const billStatusLabels = {
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Mark Delivered",
  };

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center py-1">
      {allowedStatuses.map((status) => (
        <button
          key={status}
          disabled={isDisabled}
          onClick={() => onStatusUpdate(data._id, status)}
          className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap transition"
        >
          {billStatusLabels[status] || status}
        </button>
      ))}

      {/* Upload POD button — shown only when DELIVERED */}
      {data.status === "DELIVERED" && (
        <a
          href="/admin/pod/upload"
          className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 whitespace-nowrap"
        >
          Upload POD
        </a>
      )}

      {/* POD Verified badge */}
      {data.status === "POD_RECEIVED" && (
        <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 font-medium">
          ✅ POD Verified
        </span>
      )}

      {/* Show current status label if no actions */}
      {allowedStatuses.length === 0 &&
        data.status !== "DELIVERED" &&
        data.status !== "POD_RECEIVED" && (
          <span className="text-xs text-gray-400 italic">
            {data.status === "IN_TRANSIT" || data.status === "ARRIVED_AT_BRANCH"
              ? "Auto-synced with trip"
              : "—"}
          </span>
        )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const Page = () => {
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !user) fetchMe();
  }, [hasHydrated, user, fetchMe]);

  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);

  const { allowedStatuses, isDisabled } = useTripPermissions(
    trip,
    user?.branchId,
  );

  useEffect(() => {
    fetch(`/api/trips/${tripId}`)
      .then((res) => res.json())
      .then((data) => setTrip(data));
  }, [tripId]);

  const bills = trip?.bills || [];

  if (!trip) return <div className="p-6 text-gray-500">Loading...</div>;

  const statusStyles = {
    PLANNED: "bg-gray-100 text-gray-600",
    IN_TRANSIT: "bg-yellow-100 text-yellow-700",
    REACHED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
  };

  const billStatusStyles = {
    POD_RECEIVED: "bg-green-100 text-green-700",
    IN_TRANSIT: "bg-yellow-100 text-yellow-700",
    ARRIVED_AT_BRANCH: "bg-blue-100 text-blue-700",
    OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-teal-100 text-teal-700",
    CREATED: "bg-gray-100 text-gray-600",
    ADDED_TO_TRIP: "bg-gray-100 text-gray-600",
    MISSING: "bg-red-100 text-red-700",
  };

  const updateTripStatus = async (status) => {
    if (isDisabled) return;
    await fetch(`/api/trips/${trip._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await fetch(`/api/trips/${trip._id}`).then((r) => r.json());
    setTrip(updated);
  };

  const updateStatus = async (billId, status) => {
    const res = await fetch(`/api/bills/${billId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to update bill status");
      return;
    }

    const updated = await fetch(`/api/trips/${tripId}`).then((r) => r.json());
    setTrip(updated);
  };

  const colDefs = [
    {
      headerName: "S.No",
      valueGetter: "node.rowIndex + 1",
      width: 65,
    },
    {
      headerName: "LR Number",
      field: "lrNumber",
      width: 140,
    },
    {
      headerName: "From",
      valueGetter: (p) => p.data.fromBranch?.name,
      width: 130,
    },
    {
      headerName: "To",
      valueGetter: (p) => p.data.toBranch?.name,
      width: 130,
    },
    {
      field: "totalAmount",
      headerName: "Amount",
      width: 110,
      valueFormatter: (p) => `₹ ${Number(p.value || 0).toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      cellRenderer: (params) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            billStatusStyles[params.value] || "bg-gray-100 text-gray-600"
          }`}
        >
          {params.value?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      headerName: "Action",
      flex: 1,
      minWidth: 180,
      cellRenderer: (params) => (
        <BillActionCell
          data={params.data}
          userBranchId={user?.branchId}
          tripStatus={trip?.status} // ✅ key fix — trip status passed here
          onStatusUpdate={updateStatus}
        />
      ),
    },
  ];

  const steps = [
    { key: "PLANNED", label: "Planned", icon: <MdOutlineCreate /> },
    { key: "IN_TRANSIT", label: "In Transit", icon: <MdLocalShipping /> },
    { key: "REACHED", label: "Reached", icon: <MdLocationOn /> },
    { key: "COMPLETED", label: "Completed", icon: <MdCheckCircle /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === trip.status);

  const totalLRs = bills.length;
  const deliveredCount = bills.filter((b) =>
    ["DELIVERED", "POD_RECEIVED"].includes(b.status),
  ).length;
  const pendingCount = totalLRs - deliveredCount;

  const tripStatusLabels = {
    IN_TRANSIT: "Start Trip",
    REACHED: "Mark as Reached",
    COMPLETED: "Complete Trip",
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ── TOP CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {trip.tripId}
          </h1>
          <p className="text-gray-500 mt-1">
            {trip.originBranch?.name} → {trip.destinationBranch?.name}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm rounded-full font-medium ${
                statusStyles[trip.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {trip.status}
            </span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {allowedStatuses.map((status) => (
            <button
              key={status}
              disabled={isDisabled}
              onClick={() => updateTripStatus(status)}
              className="px-4 py-2 rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
            >
              {tripStatusLabels[status] || status}
            </button>
          ))}

          <button className="border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
            Download Trip Sheet
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
        {[
          { label: "Total LRs", value: totalLRs, color: "text-gray-800" },
          {
            label: "Delivered",
            value: deliveredCount,
            color: "text-green-600",
          },
          { label: "Pending", value: pendingCount, color: "text-yellow-600" },
          {
            label: "Total Amount",
            value: `₹ ${trip.totalAmount?.toFixed(2)}`,
            color: "text-gray-800",
          },
          {
            label: "Unpaid Amount",
            value: `₹ ${trip.totalUnpaidAmount?.toFixed(2)}`,
            color: "text-red-600",
          },
          {
            label: "Net Payable",
            value: `₹ ${trip.netPayableAmount?.toFixed(2)}`,
            color: "text-gray-800",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-6 mt-6 space-y-4">
          {/* ── TIMELINE ── */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="relative flex items-center justify-between">
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200" />
              <div
                className="absolute top-5 left-0 h-1 bg-green-500 transition-all duration-300"
                style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                }}
              />
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300
                        ${isCompleted ? "bg-green-500 text-white" : ""}
                        ${isCurrent ? "bg-blue-500 text-white scale-110" : ""}
                        ${!isCompleted && !isCurrent ? "bg-gray-200 text-gray-500" : ""}
                      `}
                    >
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <p className="text-xs mt-3 text-gray-600 text-center">
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BILLS TABLE ── */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            {/* Trip status info banner */}
            {trip.status === "PLANNED" || trip.status === "IN_TRANSIT" ? (
              <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                💡 Bill delivery actions (Out for Delivery, Delivered) will be
                available once the trip is <strong>REACHED</strong>.
              </div>
            ) : null}

            <div className="ag-theme-quartz" style={{ height: 400 }}>
              <AgGridReact
                rowData={bills}
                columnDefs={colDefs}
                rowHeight={52}
              />
            </div>
          </div>
        </div>

        {/* ── SIDE PANEL ── */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">Trip Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Driver</span>
              <span className="font-medium">{trip.driver || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vehicle</span>
              <span className="font-medium">{trip.vehicleNumber || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Articles</span>
              <span className="font-medium">{trip.totalArticels || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Agency Charge</span>
              <span className="font-medium">
                {trip.agencyCharges?.chargeRate}% (₹
                {trip.agencyCharges?.chargeAmount?.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Status dependency guide */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Status Flow
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>🔵 Trip starts → Bills auto IN_TRANSIT</p>
              <p>🟡 Trip reached → Bills auto ARRIVED</p>
              <p>🚚 Then agent marks OUT_FOR_DELIVERY</p>
              <p>✅ Then agent marks DELIVERED</p>
              <p>📄 Admin verifies POD → POD_RECEIVED</p>
              <p>🏁 All POD done → Trip COMPLETED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
