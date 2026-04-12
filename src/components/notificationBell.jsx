// components/NotificationBell.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { FaBell, FaTimes, FaMoneyBillWave, FaFileAlt, FaBullhorn, FaCheckCircle } from "react-icons/fa";

const iconMap = {
  PAYMENT_REMINDER: <FaMoneyBillWave className="text-orange-500" />,
  PAYMENT_RECEIVED: <FaCheckCircle className="text-green-500" />,
  LOAD_STATEMENT_GENERATED: <FaFileAlt className="text-blue-500" />,
  ANNOUNCEMENT: <FaBullhorn className="text-purple-500" />,
  GENERAL: <FaBullhorn className="text-gray-400" />,
};

export default function NotificationBell({ branchId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/messages?branchId=${branchId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`/api/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId }),
      });
      
      if (!res.ok) throw new Error("Failed to mark as read");
      
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    if (branchId) fetchNotifications();
  }, [branchId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <FaBell className="text-white text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)}><FaTimes className="text-gray-400 text-xs" /></button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex gap-3 px-4 py-3 border-b hover:bg-gray-50 ${!n.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`}
                >
                  <div className="mt-0.5 flex-shrink-0">{iconMap[n.type] || iconMap.GENERAL}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{n.title || "Notification"}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{n.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString("en-GB", { 
                        day: "2-digit", 
                        month: "short", 
                        year: "numeric", 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}