"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { FiSearch } from "react-icons/fi";
import { FaHome } from "react-icons/fa";
import { FaPeopleGroup, FaClipboardList, FaTruckMoving } from "react-icons/fa6";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdListAlt } from "react-icons/md";
import { GrDocumentVerified } from "react-icons/gr";
import { LuMail } from "react-icons/lu";

const STATUS_OPTIONS = ["", "NEW", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];

const StatusPill = ({ status }) => {
  const styles = {
    NEW: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status === "IN_PROGRESS" ? "In Progress" : status}
    </span>
  );
};

const formatDateTime = (value) => {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return { date: "", time: "" };
    const date = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  } catch {
    return { date: "", time: "" };
  }
};

const AdminSidebar = ({ newCount }) => {
  const pathname = usePathname();
  const items = [
    { label: "Dashboard", href: "/admin", icon: <FaHome /> },
    { label: "Invoice Console", href: "/admin/invoice-section", icon: <LiaFileInvoiceSolid /> },
    { label: "Invoice List", href: "/admin/bills", icon: <MdListAlt /> },
    { label: "Agencies", href: "/admin/agencies", icon: <FaPeopleGroup /> },
    { label: "POD Verification", href: "/admin/pod/verification", icon: <GrDocumentVerified /> },
    { label: "Trip Sheets", href: "/admin/trips", icon: <FaClipboardList /> },
    { label: "Booking Requests", href: "/admin/booking-requests", icon: <FaTruckMoving /> },
  ];

  return (
    <aside className="w-64 border-r bg-white min-h-[calc(100vh-56px)]">
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-3">Navigation</div>
        <nav className="space-y-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                pathname === it.href
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{it.icon}</span>
              <span>{it.label}</span>
            </Link>
          ))}

          <Link
            href="/admin/contact-messages"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              pathname === "/admin/contact-messages"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">
              <LuMail />
            </span>
            <span className="flex-1">Contact Messages</span>
            {newCount > 0 ? (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-7 h-7 px-2 flex items-center justify-center">
                {newCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default function ContactMessagesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [viewOpen, setViewOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [nextStatus, setNextStatus] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const fetchList = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/contact-messages?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load contact messages");
        return;
      }

      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total ?? 0));
      setNewCount(Number(data?.newCount ?? 0));
    } catch (e) {
      if (e?.name !== "AbortError") setError("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      const controller = new AbortController();
      fetchList(controller.signal);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onOpenView = (row) => {
    setActive(row);
    setNextStatus(row?.status || "NEW");
    setViewOpen(true);
  };

  const onSaveStatus = async () => {
    if (!active?._id || !nextStatus) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/contact-messages/${active._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to update status");
        return;
      }

      setViewOpen(false);
      setActive(null);
      const controller = new AbortController();
      await fetchList(controller.signal);
    } catch {
      setError("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(total, page * pageSize);

  return (
    <div className="flex">
      <AdminSidebar newCount={newCount} />

      <div className="flex-1 bg-gray-50 min-h-[calc(100vh-56px)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage messages submitted from the contact page.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, phone, email, or message..."
                className="w-[390px] bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="text-sm bg-transparent outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option || "All"} value={option}>
                    {option || "All"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="mt-5 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-semibold px-5 py-4 w-12">#</th>
                  <th className="text-left font-semibold px-5 py-4">Message ID</th>
                  <th className="text-left font-semibold px-5 py-4">Customer</th>
                  <th className="text-left font-semibold px-5 py-4">Contact</th>
                  <th className="text-left font-semibold px-5 py-4">Message</th>
                  <th className="text-left font-semibold px-5 py-4">Received On</th>
                  <th className="text-left font-semibold px-5 py-4">Status</th>
                  <th className="text-left font-semibold px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <CircularProgress size={18} />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                      No contact messages found.
                    </td>
                  </tr>
                ) : (
                  items.map((row, idx) => {
                    const { date, time } = formatDateTime(row?.createdAt);
                    const number = (page - 1) * pageSize + idx + 1;
                    return (
                      <tr key={row?._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-gray-700">{number}</td>
                        <td className="px-5 py-4 font-medium text-gray-900">{row?.messageId || "-"}</td>
                        <td className="px-5 py-4 text-gray-700">{row?.name || "-"}</td>
                        <td className="px-5 py-4 text-gray-700">
                          <div>+91 {row?.phoneNumber || "-"}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{row?.email || ""}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-700 max-w-md">
                          <div className="line-clamp-2">{row?.message || "-"}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          <div className="font-medium">{date}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{time}</div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={row?.status} />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => onOpenView(row)}
                            className="border border-gray-200 hover:border-gray-300 bg-white rounded-lg px-3 py-1.5 text-sm text-gray-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t bg-white">
            <div className="text-xs text-gray-500">
              Showing {showingFrom} to {showingTo} of {total} messages
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`w-9 h-9 rounded-lg border text-sm ${
                  page <= 1 ? "text-gray-300 border-gray-200" : "text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Prev
              </button>

              <button className="w-9 h-9 rounded-lg border text-sm bg-blue-700 text-white border-blue-700">
                {page}
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`w-9 h-9 rounded-lg border text-sm ${
                  page >= totalPages ? "text-gray-300 border-gray-200" : "text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Contact Message</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {active ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <Typography sx={{ fontSize: "0.95rem" }}>
                  <b>Message ID:</b> {active.messageId || "-"}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem" }}>
                  <b>Name:</b> {active.name || "-"}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem" }}>
                  <b>Phone:</b> +91 {active.phoneNumber || "-"}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem" }}>
                  <b>Email:</b> {active.email || "-"}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                  <b>Message:</b> {active.message || "-"}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 700, mb: 0.75 }}>Status</Typography>
                  <Select
                    fullWidth
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    disabled={saving}
                  >
                    <MenuItem value="NEW">New</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="ARCHIVED">Archived</MenuItem>
                  </Select>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                  <Button variant="outlined" fullWidth onClick={() => setViewOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="contained" fullWidth onClick={onSaveStatus} disabled={saving} sx={{ backgroundColor: "#1d4ed8" }}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
