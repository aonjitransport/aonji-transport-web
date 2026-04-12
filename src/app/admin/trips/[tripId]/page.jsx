// trips/[tripId]/page.jsx
"use client";
// This page is for managing a single trip and its bills
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

import {
  ModuleRegistry,
  ClientSideRowModelModule, // ✅ import this
} from "ag-grid-community"; // ✅ note: no AllCommunityModule anymore in v33+

// ✅ Register required module
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Page = () => {
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  useEffect(() => {
    if (hasHydrated && !user) {
      fetchMe();
    }
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

  if (!trip) return <div>Loading...</div>;

  const userBranchId = user?.branchId; // or get from auth store

  const isOrigin = trip.originBranch?._id === userBranchId;
  const isDestination = trip.destinationBranch?._id === userBranchId;

  const statusStyles = {
    CREATED: "bg-gray-100 text-gray-600",
    IN_TRANSIT: "bg-yellow-100 text-yellow-700",
    REACHED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
  };

  const getAllowedStatuses = () => {
    const map = {
      PLANNED: isOrigin ? ["IN_TRANSIT"] : [],
      IN_TRANSIT: isDestination ? ["REACHED"] : [],
      REACHED: isDestination ? ["COMPLETED"] : [],
      COMPLETED: [],
    };

    return map[trip.status] || [];
  };

  const getBillNextStatuses = (status) => {
    const flow = {
      ARRIVED_AT_BRANCH: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: ["POD_RECEIVED"],
      POD_RECEIVED: [],
    };

    return flow[status] || [];
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

  console.log("Trip data:", trip); // Debugging log

  const getNextStatuses = (currentStatus) => {
    const flow = {
      PLANNED: ["IN_TRANSIT"],
      IN_TRANSIT: ["REACHED"],
      REACHED: ["COMPLETED"],
      COMPLETED: [],
    };

    return flow[currentStatus] || [];
  };
  const colDefs = [
    { headerName: "S.No", valueGetter: "node.rowIndex + 1", width: 70 },
    { headerName: "LR Number", field: "lrNumber" },
    { headerName: "From", valueGetter: (p) => p.data.fromBranch?.name },
    { headerName: "To", valueGetter: (p) => p.data.toBranch?.name },
    {
      field: "totalAmount",
      headerName: "Amount",
      valueFormatter: (params) => `₹ ${Number(params.value || 0).toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const status = params.value;

        const styles = {
          POD_RECEIVED: "bg-green-100 text-green-700",
          IN_TRANSIT: "bg-yellow-100 text-yellow-700",
          CREATED: "bg-gray-100 text-gray-600",
          MISSING: "bg-red-100 text-red-700",
        };

        return (
          <span
            className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
          >
            {status.replace(/_/g, " ")}
          </span>
        );
      },
    },

    /*  {
      headerName: "Action",
      field: "_id",
      cellRenderer: (params) => {
        const { allowedStatuses, isDisabled } = useBillPermissions(
          params.data,
          user?.branchId,
        );

        return (
          <select
            disabled={isDisabled}
            value={params.data.status}
            onChange={(e) => updateStatus(params.data._id, e.target.value)}
          >
            <option value={params.data.status}>{params.data.status}</option>

            {allowedStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        );
      },
    }, */

   {
  headerName: "Action",
  cellRenderer: (params) => {
    const { allowedStatuses, isDisabled } = useBillPermissions(
      params.data,
      user?.branchId
    );

    return (
      <div className="flex gap-2 mt-2 justify-center items-center ">
        {allowedStatuses.map((status) => (
          <button
            key={status}
            disabled={isDisabled}
            onClick={() => updateStatus(params.data._id, status)}
            className={`
              px-2 py-1 text-xs rounded-md transition
              ${
                isDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {billStatusLabels[status] || status}
          </button>
        ))}
      </div>
    );
  },
}
  ];

  const updateStatus = async (billId, status) => {
  await fetch(`/api/bills/${billId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const updated = await fetch(`/api/trips/${tripId}`).then((r) =>
    r.json()
  );

  setTrip(updated);
};

  const totalLRs = bills.length;

  const totalAmount = bills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const deliveredCount = bills.filter(
    (b) => b.status === "POD_RECEIVED" || b.status === "DELIVERED",
  ).length;

  const pendingCount = totalLRs - deliveredCount;

  const steps = [
    { key: "CREATED", label: "Created" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "REACHED", label: "Reached" },
    { key: "COMPLETED", label: "Completed" },
  ];

  const billStatusLabels = {
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Mark Delivered",
  POD_RECEIVED: "POD Received",
};

  const currentStepIndex = steps.findIndex((s) => s.key === trip.status);

  const stepIcons = {
    CREATED: <MdOutlineCreate />,
    IN_TRANSIT: <MdLocalShipping />,
    REACHED: <MdLocationOn />,
    COMPLETED: <MdCheckCircle />,
  };

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-start">
          {/* LEFT SIDE */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {trip.tripId}
            </h1>

            <p className="text-gray-500 mt-1">karthikbranch → kadapa agent</p>

            {/* STATUS */}
            <div className="mt-3 flex items-center gap-2">
              <p>Trip: {trip.tripId}</p>
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium ${statusStyles[trip.status]}`}
              >
                {trip.status}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex gap-3">
            {/* STATUS ACTION BUTTONS */}
            {allowedStatuses.map((status) => (
              <button
                key={status}
                disabled={isDisabled}
                onClick={() => updateTripStatus(status)}
                className={`
        px-4 py-2 rounded-lg shadow-sm transition
        ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }
      `}
              >
                {status === "IN_TRANSIT" && "Start Trip"}
                {status === "REACHED" && "Mark as Reached"}
                {status === "COMPLETED" && "Complete Trip"}
              </button>
            ))}

            {/* DOWNLOAD BUTTON */}
            <button className="border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
              Download Trip Sheet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
          {/* TOTAL LRs */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Total LRs</p>
            <h2 className="text-xl font-semibold mt-1"> {totalLRs} </h2>
          </div>

          {/* DELIVERED */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Delivered</p>
            <h2 className="text-xl font-semibold mt-1 text-green-600">
              {deliveredCount}
            </h2>
          </div>

          {/* PENDING */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <h2 className="text-xl font-semibold mt-1 text-yellow-600">
              {pendingCount}
            </h2>
          </div>

          {/* TOTAL AMOUNT */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-lg font-semibold mt-1">
              ₹ {trip.totalAmount?.toFixed(2)}
            </p>
          </div>

          {/* TOTAL UNPAID AMOUNT */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Unpaid Amount</p>
            <p className="text-lg font-semibold mt-1">
              ₹ {trip.totalUnpaidAmount?.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Payable Amount</p>
            <p className="text-lg font-semibold mt-1">
              ₹ {trip.netPayableAmount?.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 grid col-span-6">
            {/* timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
              <div className="relative flex items-center justify-between">
                {/* BASE LINE */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200" />

                {/* ACTIVE LINE */}
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
                      {/* CIRCLE */}
                      <div
                        className={`
              w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold
              transition-all duration-300
              ${isCompleted ? "bg-green-500 text-white" : ""}
              ${isCurrent ? "bg-blue-500 text-white scale-110" : ""}
              ${!isCompleted && !isCurrent ? "bg-gray-200 text-gray-500" : ""}
            `}
                      >
                        <span className="text-lg">{stepIcons[step.key]}</span>
                      </div>

                      {/* LABEL */}
                      <p className="text-xs mt-3 text-gray-600 text-center">
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm  mt-6">
              <div className="ag-theme-quartz" style={{ height: 400 }}>
                <AgGridReact rowData={bills} columnDefs={colDefs} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 grid  col-span-2">
            <h2 className="text-lg font-semibold">Additional Info</h2>
            some other content here
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
