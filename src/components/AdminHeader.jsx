"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Drawer from "@mui/material/Drawer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import { RiAccountCircleFill, RiRadioButtonLine } from "react-icons/ri";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import logo from "../../public/ANJITLOG.svg";
import NotificationBell from "./notificationBell";
import { set } from "mongoose";

const AdminHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
    

  const role = useAuthStore((s) => s.user?.role);
  const adminName = useAuthStore((s) => s.user?.name);
  const branchId = useAuthStore((s) => s.user?.branchId);


  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [openCreateAdmin, setOpenCreateAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [userBranch, setUserBranch] = useState(null);

  /* ───────────── FORM STATE ───────────── */
  const [form, setForm] = React.useState({
    name: "",
    loginId: "",
    password: "",
  });

  const [branchMode, setBranchMode] = useState("NEW"); // ✅ FIXED
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [branchForm, setBranchForm] = useState({
    name: "",
    city: "",
    phone: "",
    address: "",
    code: "",
  });




  /* ───────────── LOAD BRANCHES ───────────── */
  useEffect(() => {
    if (openCreateAdmin && branchMode === "EXISTING") {
      const fetchBranches = async () => {
        try {
          const res = await fetch("/api/branches", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }); 
          const data = await res.json();
         
          if (res.ok) {
             console.log(data);
            setBranches(data);
              console .log("Branches loaded:", branches);
          } else {
            setError(data.error || "Failed to load branches");
          }
        } catch (err) {
          setError("Failed to load branches");
        }
      };
      fetchBranches();
    }
  }, [openCreateAdmin, branchMode]);

  /* ───────────── load user's branch ───────────── */
  useEffect(() => {
    console.log("pathname:", pathname, );
    if (branchId) {
      const fetchUserBranch = async () => { 
        try {
          const res = await fetch(`/api/branches/${branchId}`, {
            method: "GET",  
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const data = await res.json();  
          if (res.ok) {
            console.log("User's branch loaded:", data);
            setUserBranch(data);
          } else {
            console.error("Failed to load user's branch:", data.error);
          }   
        } catch (err) {
          console.error("Error loading user's branch:", err);
        } 
      };
      fetchUserBranch();
    } 
    
  }, [branchId]);


  /* ───────────── CREATE ADMIN ───────────── */
  const handleCreateAdmin = async () => {
    setError("");

    if (!form.name || !form.loginId || !form.password) {
      return setError("All fields required");
    }

    if (branchMode === "NEW" && !branchForm.name) {
      return setError("Branch name required");
    }

    if (branchMode === "EXISTING" && !selectedBranchId) {
      return setError("Select a branch");
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        branchMode,
        branchId: branchMode === "EXISTING" ? selectedBranchId : undefined,
        branchData: branchMode === "NEW" ? branchForm : undefined,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error);

      alert("Admin created successfully");
      setOpenCreateAdmin(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  

  /* ───────────── LOGOUT ───────────── */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    setUserBranch(null);
    
    router.push(role === "agent" ? "/agent/login" : "/admin/login");
    setDrawerOpen(false);
  };

  

  return (
    <>

     
      <div className="w-full p-2 bg-blue-950 flex justify-between items-center sticky top-0 z-50">
        <Link href={"/admin"}>
          <Image src={logo} alt="logo" className="w-28" />
        </Link>

        {pathname=== "/admin/login"? null : 
        <div className="flex items-center gap-4">
          {branchId && <NotificationBell branchId={branchId} />}
          <RiAccountCircleFill
            size={30}
            color="white"
            className="cursor-pointer"
            onClick={() => setDrawerOpen(true)}
          />
        </div>
        
        }

        

      </div>  
 

      {/* ───────────── DRAWER ───────────── */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="w-64 p-4 space-y-4">
          <div className="text-xl font-semibold">Admin Panel</div>

          <div className="flex flex-col items-center border-b pb-4">
            <RiAccountCircleFill size={60} />
            <div>{adminName}</div>
            <div className="text-sm">Role: {role}</div>
            <div>
              {userBranch && (  
                <div className="flex gap-2 items-center "> 
                  <div className="font-semibold">Branch: {userBranch.name}</div>
                </div>
              )}  

          </div>
            <div className="flex items-center text-green-600">
              <RiRadioButtonLine /> Active
            </div>
          </div>

          

          {role === "super_admin" && (
            <div
              onClick={() => setOpenCreateAdmin(true)}
              className="cursor-pointer hover:bg-gray-200 p-2 rounded"
            >
              Create Admin
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 rounded"
          >
            Logout
          </button>
        </div>
      </Drawer>

      {/* ───────────── CREATE ADMIN MODAL ───────────── */}
      <Dialog open={openCreateAdmin} onClose={() => setOpenCreateAdmin(false)}>
        <DialogTitle>Create Admin</DialogTitle>
        <DialogContent className="space-y-4 w-80 mt-2">

          <TextField label="Name" fullWidth
            onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <TextField label="Login ID" fullWidth
            onChange={(e) => setForm({ ...form, loginId: e.target.value })} />

          <TextField label="Password" type="password" fullWidth
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <Select fullWidth value={branchMode} onChange={(e) => setBranchMode(e.target.value)}>
            <MenuItem value="NEW">Create New Branch</MenuItem>
            <MenuItem value="EXISTING">Use Existing Branch</MenuItem>
          </Select>

          {branchMode === "EXISTING" && (
            <Select fullWidth value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}>
              {branches?.map((b) => (
                <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
              ))}
            </Select>
          )}

          {branchMode === "NEW" && (
            <>
              <TextField label="Branch Name" fullWidth
                onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} />
                <TextField label="Branch Code" fullWidth
                onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })} />
              <TextField label="City" fullWidth
                onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} /> 
              <TextField label="Phone" fullWidth
                onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} />
              <TextField label="Address" fullWidth
                onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} />
            </>
          )}

          {error && <div className="text-red-600">{error}</div>}

          <button
            onClick={()=>(console.log( "Form Data:", form, "Branch Mode:", branchMode, "Selected Branch ID:", selectedBranchId, "Branch Form Data:", branchForm,  handleCreateAdmin() ))}
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded w-full"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminHeader;
