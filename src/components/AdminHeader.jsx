"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/ANJITLOG.svg";
import { RiAccountCircleFill, RiRadioButtonLine } from "react-icons/ri";
import Drawer from "@mui/material/Drawer";
import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

const AdminHeader = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [openCreateAdmin, setOpenCreateAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState({
    name: "",
    loginId: "",
    password: "",
  });

  const adminName = useAuthStore((state) => state.user?.name);
  const role = useAuthStore((state) => state.user?.role);

  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    router.push("/admin/login");
    setIsDrawerOpen(false);
  };

  const handleCreateAdmin = async () => {
    setError("");

    if (!form.name || !form.loginId || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create admin");
        return;
      }

      // success
      setOpenCreateAdmin(false);
      setForm({ name: "", loginId: "", password: "" });
      alert("Admin created successfully");

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full p-1 bg-blue-950 flex justify-between sticky top-0 z-50 print:hidden">
        <Link href="/admin">
          <Image src={logo} className="w-28 mt-1" alt="logo" />
        </Link>

        {!isLoginPage && (
          <div className="flex items-center mr-4 gap-2 cursor-pointer">
            <RiAccountCircleFill
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              color="white"
              size={30}
            />

            <Drawer
              anchor="right"
              open={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
            >
              <div className="w-64 p-4 flex flex-col gap-4">
                <div className="text-xl font-semibold">Admin Panel</div>

                <div className="flex flex-col items-center gap-2 border-b pb-4">
                  <RiAccountCircleFill color="gray" size={60} />
                  <div className="font-medium">{adminName}</div>
                  <div className="font-semibold">{role}</div>

                  <div className="text-gray-500 flex items-center">
                    <RiRadioButtonLine color="green" size={15} />
                    <span className="ml-1">Active</span>
                  </div>
                </div>

                {/* 👑 SUPER ADMIN ONLY */}
                {role === "super_admin" && (
                  <div
                    onClick={() => setOpenCreateAdmin(true)}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                  >
                    Create Admin
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </Drawer>
          </div>
        )}
      </div>

      {/* ================= CREATE ADMIN DIALOG ================= */}
      <Dialog open={openCreateAdmin} onClose={() => setOpenCreateAdmin(false)}>
        <DialogTitle>Create Admin</DialogTitle>

        <DialogContent>
          <div className="flex flex-col gap-4 mt-4 w-72">
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <TextField
              label="Login ID"
              fullWidth
              value={form.loginId}
              onChange={(e) =>
                setForm({ ...form, loginId: e.target.value })
              }
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminHeader;
