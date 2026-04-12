// src/app/admin/agencies/[id]/page.jsx
"use client";
// At the top with other imports
import PusherClient from "pusher-js";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Chip from "@mui/material/Chip";
import { useLoadStatementsStore } from "../../../../store/useLoadStatementStore"; // ✅ new store
import { useAuthStore } from "../../../../store/useAuthStore";

import { AgGridReact } from "ag-grid-react";
import useBranchStore from "../../../../store/branchStore";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Select, MenuItem } from "@mui/material";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaPencilAlt,
  FaTrash,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaHashtag,
  FaInfoCircle,
  FaCalendarAlt,
  FaChevronRight,
  FaRupeeSign,
  FaUserTie,
  FaWallet,
  FaBell,
  FaMoneyBillWave,
  FaFileAlt,
  FaBullhorn,
} from "react-icons/fa";

import {
  ModuleRegistry,
  ClientSideRowModelModule, // ✅ import this
} from "ag-grid-community"; // ✅ note: no AllCommunityModule anymore in v33+

// ✅ Register required module
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const AgencyPage = () => {
  const messagesEndRef = useRef(null);
  const { id } = useParams();
  const [branchNotifications, setBranchNotifications] = useState([]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [branchNotifications]);

  const [branch, setBranch] = useState(null);
  const fetchBranches = useBranchStore((s) => s.fetchBranches);
  const branches = useBranchStore((s) => s.branches);
  const fetchBranch = useBranchStore((s) => s.fetchBranchById); // ✅ new function to fetch single branch by ID

  const [generateLoadStatementsModal, setGenerateLoadStatementsModal] =
    useState(false);
  const [loadStatementPayload, setLoadStatementPayload] = useState({
    month: "",
    year: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editAgencyModal, setEditAgencyModal] = useState(false);

  const [editAgencyPayload, setEditAgencyPayload] = useState({
    serviceAreas: [],
    phone: branch?.phone || "",
  });

  const [newArea, setNewArea] = useState("");

  // ✅ Zustand store for load statements
  const {
    loadStatements,
    fetchLoadStatements,
    closeLoadStatement,

    loading,
  } = useLoadStatementsStore();

  const [filters, setFilters] = useState({
    month: "",
    year: "",
  });

  // ✅ Month & Year options
  const months = [
    "Month",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = ["Year", 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    if (branches.length === 0) {
      fetchBranches();
    } else {
      const foundBranch = branches.find((item) => item._id.toString() === id);
      setBranch(foundBranch);
    }
  }, [id, branches, fetchBranches, fetchBranch]);

  // ✅ Fetch load statements when agency or filters change
  useEffect(() => {
    if (!branch?._id) return;
    fetchLoadStatements(branch._id, filters);
  }, [branch, filters]);

  const socketRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    if (!branch?._id) return;
    fetch(`/api/messages?branchId=${branch._id}`)
      .then((r) => r.json())
      .then((msgs) => {
        setBranchNotifications([...msgs].reverse());
        if (msgs.some((m) => !m.isRead)) {
          fetch("/api/messages", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ branchId: branch._id }),
          });
        }
      });
  }, [branch?._id]);

  // Pusher subscription
  useEffect(() => {
    if (!branch?._id) return;

    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`branch-${branch._id}`);

    channel.bind("new-message", (newMsg) => {
      setBranchNotifications((prev) => [...prev, newMsg]);
      fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: branch._id }),
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`branch-${branch._id}`);
      pusher.disconnect();
    };
  }, [branch?._id]);

  // Add this state in AgencyPage
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    statement: null,
  });
  const [paymentPayload, setPaymentPayload] = useState({
    amount: "",
    note: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  // Get current user from auth store
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  useEffect(() => {
    if (hasHydrated && !user) {
      fetchMe();
    }
  }, [hasHydrated, user, fetchMe]);
  const isAdmin = user?.role === "admin";

  const handleRecordPayment = async () => {
    if (!paymentPayload.amount || Number(paymentPayload.amount) <= 0) {
      setPaymentError("Please enter a valid amount");
      return;
    }
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const res = await fetch(
        `/api/load-statements/${paymentModal.statement._id}/payment`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(paymentPayload.amount),
            note: paymentPayload.note,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      // Show success message
      setPaymentSuccess(true);

      // Auto-close modal after 1.5 seconds
      setTimeout(() => {
        setPaymentModal({ open: false, statement: null });
        setPaymentPayload({ amount: "", note: "" });
        setPaymentSuccess(false);
        fetchLoadStatements(branch._id, filters); // refresh

        // Also refetch messages to show payment notification
        fetch(`/api/messages?branchId=${branch._id}`)
          .then((r) => r.json())
          .then((msgs) => setBranchNotifications([...msgs].reverse()))
          .catch((err) => console.error("Error fetching messages:", err));
      }, 1500);
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !branch?._id || !user?.id) {
      return;
    }

    setMessageSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branch._id,
          content: messageInput.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Clear input and refresh messages
      setMessageInput("");

      // Refetch messages to show the new message
      const messagesRes = await fetch(`/api/messages?branchId=${branch._id}`);
      const messages = await messagesRes.json();
      setBranchNotifications([...messages].reverse());
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setMessageSending(false);
    }
  };

  if (!branch) return <p>Loading...</p>;

  // ✅ AG Grid columns
  const columnDefs = [
    {
      headerName: "Month",
      field: "month",
      width: 120,
      valueFormatter: (p) => months[p.value] || "-",
    },
    { headerName: "Year", field: "year", width: 100 },

    {
      headerName: "Freight",
      field: "totalFreightAmount",
      width: 140,
      valueFormatter: (p) => `₹ ${p.value?.toFixed(2) || 0}`,
    },

    {
      headerName: "Paid",
      field: "totalFreightAmount",
      width: 140,
      valueFormatter: (p) => {
        const paid = p.value - p.data.balanceDue;
        return `₹ ${paid.toFixed(2)}`;
      },
    },

    {
      headerName: "Balance",
      field: "balanceDue",
      width: 140,
      valueFormatter: (p) => `₹ ${p.value?.toFixed(2) || 0}`,
      cellStyle: (p) => ({
        color: p.value > 0 ? "red" : "green",
        fontWeight: "600",
      }),
    },

    {
      headerName: "Status",
      field: "paymentStatus",
      width: 120,
      cellRenderer: (p) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            p.value
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {p.value ? "Closed" : "Pending"}
        </span>
      ),
    },

    {
      headerName: "PDF",
      field: "_id",
      width: 120,
      cellRenderer: (params) => (
        <a
          href={`/admin/load-statements/${params.data._id}/pdf-preview`}
          target="_blank"
          className="text-blue-600 underline text-sm"
        >
          Download
        </a>
      ),
    },
    {
      headerName: "Action",
      field: "_id",
      width: 150,
      cellRenderer: (params) =>
        isAdmin ? (
          <button
            onClick={() =>
              setPaymentModal({ open: true, statement: params.data })
            }
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            Record Payment
          </button>
        ) : (
          <span className="text-gray-400 text-xs">View Only</span>
        ),
    },
  ];

  console.log("PAGE S", loadStatements, branch, filters);

  const handleOnchangeLoadStatementPayload = (e) => {
    const { name, value } = e.target;
    setLoadStatementPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateLoadStatement = async () => {
    // Implement the logic to generate load statements for all trips of the agency
    console.log(
      "Generating load statements for agency:",
      branch._id,
      "with payload:",
      loadStatementPayload,
    );
    const response = await fetch(`/api/load-statements/generate/`, {
      method: "POST",
      body: JSON.stringify({ ...loadStatementPayload, branchId: branch._id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Failed to generate load statements");
      return;
    }
    if (response.ok) {
      setSuccessMessage("Load statements generated successfully");
    }

    setError("");

    console.log("Generate Load Statements Response:", data);
    // Refresh load statements after generation
    fetchLoadStatements(branch._id, filters);
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate this agency?")) return;
    try {
      const response = await fetch(`/api/branches/${branch._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !branch.isActive }),
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to deactivate agency");
      }
      const data = await response.json();
      console.log("Deactivate Agency Response:", data);
      // Refresh branch data after deactivation
      fetchBranch(branch._id);
      // Optionally, you can also refresh the list of branches if needed
      fetchBranches();
    } catch (error) {
      setError(error.message || "Failed to deactivate agency");
    }
  };

  const handleAddArea = () => {
    const trimmed = newArea.trim();

    if (!trimmed) return;

    if (!editAgencyPayload.serviceAreas?.includes(trimmed)) {
      setEditAgencyPayload((prev) => ({
        ...prev,
        serviceAreas: [...(prev.serviceAreas || []), trimmed],
      }));
    }

    setNewArea("");
  };

  const handleRemoveArea = (indexToRemove) => {
    setEditAgencyPayload((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const openEditAgency = (branch) => {
    setEditAgencyPayload(branch);
    setEditAgencyModal(true);
  };

  const handleSaveAgency = async () => {
    try {
      const res = await fetch(`/api/branches/${editAgencyPayload._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceAreas: editAgencyPayload.serviceAreas,
          phone: editAgencyPayload.phone,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const updated = await res.json();

      console.log("Updated branch:", updated);

      setEditAgencyModal(false);
      // Refresh branch data after deactivation
      fetchBranch(branch._id);
      // Optionally, you can also refresh the list of branches if needed
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const CustomNoRowsOverlay = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-lg font-medium">No Load Statements</p>
        <p className="text-sm">Try selecting a different month/year</p>
      </div>
    );
  };
  const formatCurrency = (num) => `₹ ${Number(num || 0).toLocaleString()}`;

  const chartData = [
    {
      name: "Company",
      value: branch?.totalCompanyEarnings || 0,
    },
    {
      name: "Agent",
      value: branch?.totalAgencyEarnings || 0,
    },
  ];

  const COLORS = ["#3b82f6", "#22c55e"]; // blue + green

  return (
    <>
      <div className=" ">
        {/* Header Info */}
        {/* 🔷 HEADER */}
        <div className="m-2 p-4 bg-white rounded-xl shadow border">
          {/* 🔹 Top Row: Name + Meta + Button */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-4">
              {/* Icon Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaBuilding className="text-blue-500 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{branch.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 flex-wrap">
                  <span>{branch.city}</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    <span
                      className={`font-medium ${branch.isActive ? "text-green-600" : "text-red-500"}`}
                    >
                      {branch.isActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                    Code: {branch.code}
                  </span>
                </div>
              </div>
            </div>

            {/* View Trips Button */}
            <button className="flex items-center gap-1.5 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              View Trips <FaChevronRight className="text-xs" />
            </button>
          </div>

          {/* 🔹 KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Trips */}
            <div className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaTruck className="text-blue-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Trips</p>
                <p className="text-lg font-bold">{branch.trips?.length || 0}</p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <FaRupeeSign className="text-purple-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Revenue</p>
                <p className="text-lg font-bold">
                  {formatCurrency(branch.totalTripAmount)}
                </p>
              </div>
            </div>

            {/* Company Share */}
            <div className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaBuilding className="text-blue-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Company Share</p>
                <p className="text-lg font-bold text-blue-700">
                  ₹ {branch.totalCompanyEarnings || 0}
                </p>
                <p className="text-[11px] text-gray-400">
                  (
                  {branch.totalTripAmount
                    ? Math.round(
                        (branch.totalCompanyEarnings / branch.totalTripAmount) *
                          100,
                      )
                    : 0}
                  %)
                </p>
              </div>
            </div>

            {/* Agent Earnings */}
            <div className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <FaUserTie className="text-green-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Agent Earnings</p>
                <p className="text-lg font-bold text-green-700">
                  ₹ {branch.totalAgencyEarnings || 0}
                </p>
                <p className="text-[11px] text-gray-400">
                  (
                  {branch.totalTripAmount
                    ? Math.round(
                        (branch.totalAgencyEarnings / branch.totalTripAmount) *
                          100,
                      )
                    : 0}
                  %)
                </p>
              </div>
            </div>

            {/* Unpaid */}
            <div className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaWallet className="text-red-400 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Unpaid Amount</p>
                <p className="text-lg font-bold text-gray-800">
                  ₹ {branch.totalUnpaidAmount || 0}
                </p>
                {(branch.totalUnpaidAmount || 0) === 0 && (
                  <span className="text-[11px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                    No Dues
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🔷 INSIGHTS SECTION */}
        {/* 🔷 INSIGHTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-2">
          {/* 🔹 Financial Breakdown */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            {/* Header with Last Updated */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Financial Breakdown</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Last Updated:{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Donut Chart with center label */}
              <div className="relative w-[180px] h-[180px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={58}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹ ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-base font-bold text-gray-800">
                    ₹ {Number(branch?.totalTripAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">Total Revenue</p>
                </div>
              </div>

              {/* Right Side Data */}
              <div className="flex flex-col gap-3 text-sm w-full">
                {/* Company Earnings */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Company Earnings</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹ {branch?.totalCompanyEarnings}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {branch?.totalTripAmount
                        ? Math.round(
                            (branch.totalCompanyEarnings /
                              branch.totalTripAmount) *
                              100,
                          )
                        : 0}
                      % of Total
                    </p>
                  </div>
                </div>

                {/* Agent Earnings */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Agent Earnings</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹ {branch?.totalAgencyEarnings}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {branch?.totalTripAmount
                        ? Math.round(
                            (branch.totalAgencyEarnings /
                              branch.totalTripAmount) *
                              100,
                          )
                        : 0}
                      % of Total
                    </p>
                  </div>
                </div>

                {/* Unpaid */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-base leading-none mt-0.5">
                      ⚠
                    </span>
                    <span className="text-gray-700">Unpaid Amount</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹ {branch?.totalUnpaidAmount || 0}
                    </p>
                    {(branch?.totalUnpaidAmount || 0) === 0 && (
                      <span className="text-[11px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        No Dues
                      </span>
                    )}
                  </div>
                </div>

                {/* All payments cleared banner */}
                {(branch?.totalUnpaidAmount || 0) === 0 && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-2 rounded-lg mt-1">
                    <span className="text-green-500 text-base">✅</span>
                    <p className="text-xs">
                      All payments are up to date. No outstanding dues.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 Trips Overview */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Trips Overview</h2>
              <select className="text-sm border rounded px-2 py-1 text-gray-600">
                <option>All Time</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>

            {/* Total Trips Row */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaTruck className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Trips</p>
                <p className="text-2xl font-bold">
                  {branch.trips?.length || 0}
                </p>
                <p className="text-xs text-gray-400">
                  All trips completed successfully
                </p>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-lg" />
                </div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="font-bold text-green-700 text-lg">
                  {branch.trips?.length || 0}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                  <FaClock className="text-orange-400 text-lg" />
                </div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="font-bold text-orange-500 text-lg">0</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaTruck className="text-blue-500 text-lg" />
                </div>
                <p className="text-xs text-gray-500">In Transit</p>
                <p className="font-bold text-blue-600 text-lg">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="m-2 bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-1  mx-3">
            <h2 className="font-semibold text-lg">Load Statements</h2>

            {/* Filters on right */}
            <div className="flex gap-2">
              <select
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: e.target.value })
                }
                className="border px-3 py-1 rounded text-sm"
              >
                {months.map((m, i) => (
                  <option key={i} value={m === "Month" ? "" : m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                className="border px-3 py-1 rounded text-sm"
              >
                {years.map((y, i) => (
                  <option key={i} value={y === "Year" ? "" : y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="ag-theme-alpine w-full ">
            <AgGridReact
              rowData={loadStatements || []}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={5}
              domLayout="autoHeight"
              noRowsOverlayComponent={CustomNoRowsOverlay}
              defaultColDef={{
                flex: 1, // ✅ THIS FIXES EMPTY SPACE
                minWidth: 120,
              }}
            />
          </div>
        </div>

        {/* Agency Info */}
        {/* 🔷 AGENCY INFO */}
        {/* 🔷 AGENCY INFO */}
        {/* 🔷 AGENCY INFO */}
        <div className="grid grid-cols-2" style={{ height: "420px" }}>
          <div className="m-2 bg-white rounded-xl shadow border h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h2 className="font-bold text-lg">Agency Info</h2>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row">
              {/* Left: Info Grid */}
              <div className="flex-1 p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FaBuilding className="text-blue-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">City</p>
                    <p className="font-semibold text-sm">{branch.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-purple-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      Service Areas
                    </p>
                    <p className="font-semibold text-sm">
                      {branch.serviceAreas?.join(", ") || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-green-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <p className="font-semibold text-sm">
                      {branch.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FaHashtag className="text-gray-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Code</p>
                    <p className="font-semibold text-sm">{branch.code}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-orange-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Address</p>
                    <p className="font-semibold text-sm">
                      {branch.address || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FaInfoCircle className="text-blue-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Status</p>
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        branch.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {branch.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FaCalendarAlt className="text-indigo-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Member Since</p>
                    <p className="font-semibold text-sm">
                      {branch.createdAt
                        ? new Date(branch.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditAgency(branch)}
                    className="flex items-center gap-1.5 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <FaPencilAlt className="text-xs" /> Edit
                  </button>
                  <button
                    onClick={handleDeactivate}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white ${
                      branch.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    <FaTrash className="text-xs" />
                    {branch.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-gray-100" />
            </div>
          </div>

          {/* Right: Messages & Alerts Panel */}
          {/* Right: Messages & Alerts Panel */}
          <div
            className="m-2 bg-white rounded-xl shadow border overflow-hidden"
            style={{ height: "calc(100% - 16px)" }}
          >
            {/* Panel Header - fixed */}
            <div
              className="flex justify-between items-center px-4 py-3 border-b bg-gray-50"
              style={{ height: "52px" }}
            >
              <div className="flex items-center gap-2">
                <FaBell className="text-gray-500 text-sm" />
                <p className="font-semibold text-sm text-gray-700">
                  Messages & Alerts
                </p>
              </div>
              {branchNotifications.filter((n) => !n.isRead).length > 0 && (
                <span className="text-[11px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                  {branchNotifications.filter((n) => !n.isRead).length} new
                </span>
              )}
            </div>

            {/* Messages List - fixed scroll area */}
            <div
              ref={messagesEndRef}
              className="overflow-y-auto px-3 py-2 flex flex-col gap-2 bg-gray-50"
              style={{ height: "calc(100% - 52px - 56px)" }}
            >
              {branchNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FaBell className="text-gray-200 text-4xl mb-3" />
                  <p className="text-sm text-gray-400 font-medium">
                    No messages yet
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Chat with your team
                  </p>
                </div>
              ) : (
                branchNotifications.map((n) => {
                  const isMine =
                    n.sender?._id?.toString() === user?.id?.toString() ||
                    n.senderName === user?.name;
                  const senderName =
                    n.sender?.name || n.senderName || "Unknown";
                  const initial = senderName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={n._id}
                      className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isMine ? "bg-blue-500" : "bg-gray-400"}`}
                      >
                        {initial}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}
                      >
                        {/* Sender name - only for received */}
                        <p className="text-[10px] text-gray-400 mb-0.5 px-1">
                          {isMine ? "You" : senderName}
                        </p>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                          }`}
                        >
                          {n.content}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 px-1">
                          {new Date(n.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input - fixed at bottom */}
            <div
              className="flex gap-2 items-center px-2 py-2 border-t bg-gray-50"
              style={{ height: "56px" }}
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    !messageSending &&
                    messageInput.trim()
                  ) {
                    handleSendMessage();
                  }
                }}
                placeholder="Type message..."
                disabled={!user?.id || messageSending}
                className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!user?.id || messageSending || !messageInput.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {messageSending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals Section */}

      {paymentModal.open && (
        <Dialog
          open={paymentModal.open}
          onClose={() => setPaymentModal({ open: false, statement: null })}
        >
          <DialogTitle className="font-bold text-lg">
            Record Payment
          </DialogTitle>
          <DialogContent className="min-w-[400px]">
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Payment Recorded
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  ₹{paymentPayload.amount} has been successfully recorded.
                  Statement updated.
                </p>
              </div>
            ) : (
              <>
                {/* Statement summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Statement</span>
                    <span className="font-medium">
                      {paymentModal.statement?.loadStatementId}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Total Freight</span>
                    <span className="font-medium">
                      ₹ {paymentModal.statement?.totalFreightAmount}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Already Paid</span>
                    <span className="font-medium text-green-600">
                      ₹ {paymentModal.statement?.paidAmount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-gray-700 font-semibold">
                      Balance Due
                    </span>
                    <span className="font-bold text-red-600">
                      ₹ {paymentModal.statement?.balanceDue}
                    </span>
                  </div>
                </div>

                <TextField
                  label="Payment Amount (₹)"
                  type="number"
                  fullWidth
                  value={paymentPayload.amount}
                  onChange={(e) =>
                    setPaymentPayload((p) => ({ ...p, amount: e.target.value }))
                  }
                  inputProps={{ max: paymentModal.statement?.balanceDue }}
                  className="mb-3"
                  disabled={paymentLoading}
                />
                <div className="mt-3">
                  <TextField
                    label="Note (optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={paymentPayload.note}
                    onChange={(e) =>
                      setPaymentPayload((p) => ({ ...p, note: e.target.value }))
                    }
                    placeholder="e.g. Paid via bank transfer"
                    disabled={paymentLoading}
                  />
                </div>

                {paymentError && (
                  <p className="text-red-500 text-sm mt-2">{paymentError}</p>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            {paymentSuccess ? (
              <button
                onClick={() =>
                  setPaymentModal({ open: false, statement: null })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 w-full"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    setPaymentModal({ open: false, statement: null })
                  }
                  disabled={paymentLoading}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={paymentLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {paymentLoading ? "Saving..." : "Record Payment"}
                </button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* ✅ Generate Load Statements Modal */}
      {generateLoadStatementsModal && (
        <Dialog
          open={generateLoadStatementsModal}
          onClose={() => setGenerateLoadStatementsModal(false)}
        >
          <DialogTitle className="font-bold text-xl">
            Generate Load Statements
          </DialogTitle>
          <DialogContent>
            <p>
              Are you sure you want to generate load statements for all trips of{" "}
              {branch.name}?
            </p>
            <div className="mt-4">
              <label className="block mb-2 font-semibold">Month:</label>
              <Select
                fullWidth
                name="month"
                value={loadStatementPayload.month}
                onChange={handleOnchangeLoadStatementPayload}
              >
                {months?.slice(1)?.map((m, i) => (
                  <MenuItem key={i} value={m.toLowerCase()}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div className="mt-4">
              <label className="block mb-2 font-semibold">Year:</label>
              <Select
                fullWidth
                name="year"
                value={loadStatementPayload.year}
                onChange={handleOnchangeLoadStatementPayload}
              >
                {years?.slice(1)?.map((y, i) => (
                  <MenuItem key={i} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
            {successMessage && (
              <div className="text-green-600 mt-2">{successMessage}</div>
            )}
          </DialogContent>
          <DialogActions>
            <button
              onClick={() => setGenerateLoadStatementsModal(false)}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                generateLoadStatement();
                setGenerateLoadStatementsModal(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Generate
            </button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Agency Modal */}

      <Dialog
        open={editAgencyModal} // Implement state to control this modal
        onClose={() => {
          setEditAgencyModal(false);
        }} // Implement close handler
      >
        <DialogTitle className="font-bold text-xl">
          Edit Agency Info
        </DialogTitle>
        <DialogContent>
          {/* Implement form fields to edit agency info */}
          <div className="m-2">
            <TextField
              label="Service Area"
              fullWidth
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
            />
            <button
              onClick={handleAddArea}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-1 "
            >
              {" "}
              Add{" "}
            </button>
            {editAgencyPayload.serviceAreas?.map((area, index) => (
              <span
                key={index}
                id="badge-dismiss-default"
                className="inline-flex items-center m-1 px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-sm dark:bg-blue-900 dark:text-blue-300"
              >
                {area}
                <button
                  onClick={() => {
                    handleRemoveArea(index);
                  }}
                  type="button"
                  className="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-xs hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                  data-dismiss-target="#badge-dismiss-default"
                  aria-label="Remove"
                >
                  <svg
                    className="w-2 h-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    {" "}
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />{" "}
                  </svg>{" "}
                  <span className="sr-only">Remove badge</span>{" "}
                </button>{" "}
              </span>
            ))}{" "}
          </div>
          <div>
            <TextField
              label="Phone"
              fullWidth
              value={editAgencyPayload.phone}
              onChange={(e) =>
                setEditAgencyPayload((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setEditAgencyModal(false)} // Implement close handler
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAgency} // Implement save handler
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AgencyPage;
