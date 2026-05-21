"use client";

import { MdAddBusiness } from "react-icons/md";
import { useEffect, useState } from "react";
import useBranchStore from "../../../store/branchStore";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";

import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { FaTruckMoving } from "react-icons/fa";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdListAlt } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { GrDocumentVerified } from "react-icons/gr";
import { FaClipboardList } from "react-icons/fa6";
import { BsBuildings } from "react-icons/bs";
import { FaRoute } from "react-icons/fa";
import { MdOutlineCheckCircleOutline } from "react-icons/md";
import { MdOutlineDoNotDisturbOn } from "react-icons/md";
import { MdMoreVert } from "react-icons/md";
import { MdRemoveRedEye } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { MdOutlineReport } from "react-icons/md";

const page = () => {
  const fetchBranches = useBranchStore((s) => s.fetchBranches);
  const createBranch = useBranchStore((s) => s.createBranch);
  const branches = useBranchStore((s) => s.branches);

  const [openModal, setOpenModal] = useState(false);
  const [newArea, setNewArea] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 5;
  const [newBookingCount, setNewBookingCount] = useState(0);

  const [branchForm, setBranchForm] = useState({
    name: "",
    phone: "",
    city: "",
    type  : "",
    code  : "",
    address: "",
    
    
    serviceAreas: [],
  });

  const router  = useRouter();



  const [agentAuth, setAgentAuth] = useState({
    loginId: "",
    password: "",
  });
  

      function onCancelForm() {
        setOpenModal(false);
        setBranchForm({
          name: "",
          phone: "",
          city: "",
          type  : "",
          code  : "",
          serviceAreas: [],
          
          address: "",
          
        });
        setAgentAuth({ loginId: "", password: "" });
        setNewArea("");
      }

  const [showPassword, setShowPassword] = useState(false);

  const handleOnChangeInputFormData = (name,value)=>{ setBranchForm((prevState)=>({...prevState,[name]:value})) }

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/shipment-bookings/count?status=NEW", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
        });
        const data = await res.json();
        if (res.ok) setNewBookingCount(Number(data?.count ?? 0));
      } catch {
        // ignore
      }
    };

    fetchCount();
    const t = setInterval(fetchCount, 45_000);

    return () => {
      controller.abort();
      clearInterval(t);
    };
  }, []);

  const addArea = () => {
    if (newArea.trim() && !branchForm.serviceAreas.includes(newArea.trim())) {
      setBranchForm((p) => ({
        ...p,
        serviceAreas: [...p.serviceAreas, newArea.trim()],
      }));
      setNewArea("");
    }
  };

  const handleAddArea = () => {
    const trimmed = newArea.trim();
    if (trimmed && !branchForm.serviceAreas.includes(trimmed)) {
      setBranchForm((prev) => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, trimmed],
      }));
      setNewArea("");
    }
  };
  const handleRemoveArea = (indexToRemove) => {
    setBranchForm((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const submit = async () => {
    await createBranch({
      loginId: agentAuth.loginId,
      password: agentAuth.password,
      branch: branchForm,
    });
    setOpenModal(false);
    fetchBranches();
    console.log(branchForm, agentAuth);
  };

  const handleSubmit = () => {
    submit();
  }
 const togglePasswordVisibility = () => { setShowPassword((prev) => !prev); };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredBranches = branches
    .filter((b) => {
      if (statusFilter === "ACTIVE") return Boolean(b.isActive);
      if (statusFilter === "INACTIVE") return !b.isActive;
      return true;
    })
    .filter((b) => {
      if (!normalizedSearch) return true;
      return (
        String(b?.name ?? "").toLowerCase().includes(normalizedSearch) ||
        String(b?.city ?? "").toLowerCase().includes(normalizedSearch) ||
        String(b?.code ?? "").toLowerCase().includes(normalizedSearch)
      );
    });

  const totalBranches = branches.length;
  const totalTrips = branches.reduce(
    (sum, b) => sum + Number(b?.totalTrips ?? b?.trips?.length ?? 0),
    0
  );
  const activeBranches = branches.filter((b) => Boolean(b.isActive)).length;
  const inactiveBranches = totalBranches - activeBranches;

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / pageSize));
  const safePage = Math.min(pageIndex, totalPages);
  const paged = filteredBranches.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showingFrom = filteredBranches.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(filteredBranches.length, safePage * pageSize);

  const formatLastActivity = (b) => {
    try {
      const tripsCount = Number(b?.totalTrips ?? b?.trips?.length ?? 0);
      if (!tripsCount) return { label: "No activity yet", sub: "" };
      const d = new Date(b?.updatedAt ?? b?.createdAt ?? Date.now());
      const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      return { label: `${date}, ${time}`, sub: "" };
    } catch {
      return { label: "No activity yet", sub: "" };
    }
  };

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white min-h-[calc(100vh-56px)]">
          <div className="p-4">
            <nav className="space-y-2">
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <span className="text-lg"><FaHome /></span>
                <span>Dashboard</span>
              </Link>
              <Link href="/admin/invoice-section" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <span className="text-lg"><LiaFileInvoiceSolid /></span>
                <span>Invoice Console</span>
              </Link>
              <Link href="/admin/bills" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <span className="text-lg"><MdListAlt /></span>
                <span>Invoice List</span>
              </Link>
              <Link
                href="/admin/agencies"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200"
              >
                <span className="text-lg"><FaPeopleGroup /></span>
                <span>Agencies / Branches</span>
              </Link>
              <Link href="/admin/pod/verification" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <span className="text-lg"><GrDocumentVerified /></span>
                <span>POD Verification</span>
              </Link>
              <Link href="/admin/trips" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <span className="text-lg"><FaClipboardList /></span>
                <span>Trip Sheets</span>
              </Link>
              <Link
                href="/admin/booking-requests"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="text-lg"><FaTruckMoving /></span>
                <span className="flex-1">Booking Requests</span>
                {newBookingCount > 0 ? (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-7 h-7 px-2 flex items-center justify-center">
                    {newBookingCount}
                  </span>
                ) : null}
              </Link>
              <div className="pt-2">
                <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed">
                  <span className="text-lg"><MdOutlineReport /></span>
                  <span>Reports</span>
                </Link>
              </div>
            </nav>

            <div className="mt-10 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="text-sm font-semibold text-gray-900">Need Help?</div>
              <div className="text-xs text-gray-500 mt-1">Contact our support team</div>
              <button className="mt-4 w-full border border-blue-200 text-blue-700 bg-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-50">
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 bg-gray-50 min-h-[calc(100vh-56px)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agencies / Branches</h1>
              <p className="text-sm text-gray-500 mt-1">Manage all branches and view their operational overview.</p>
            </div>
            <button
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-sm"
              onClick={() => setOpenModal(true)}
            >
              <span className="text-lg">+</span> Add Branch
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
                <BsBuildings size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Branches</div>
                <div className="text-2xl font-bold text-gray-900">{totalBranches}</div>
                <div className="text-xs text-gray-400 mt-1">All locations</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-700">
                <FaRoute size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Trips</div>
                <div className="text-2xl font-bold text-gray-900">{totalTrips}</div>
                <div className="text-xs text-gray-400 mt-1">Across all branches</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-700">
                <MdOutlineCheckCircleOutline size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Active Branches</div>
                <div className="text-2xl font-bold text-gray-900">{activeBranches}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {totalBranches ? `${Math.round((activeBranches / totalBranches) * 100)}% of total` : "0% of total"}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <MdOutlineDoNotDisturbOn size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Inactive Branches</div>
                <div className="text-2xl font-bold text-gray-900">{inactiveBranches}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {totalBranches ? `${Math.round((inactiveBranches / totalBranches) * 100)}% of total` : "0% of total"}
                </div>
              </div>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <input
                value={search}
                onChange={(e) => {
                  setPageIndex(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search by branch name or city..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700">
                Filter
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700">
                <span className="font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setPageIndex(1);
                    setStatusFilter(e.target.value);
                  }}
                  className="bg-transparent outline-none text-sm"
                >
                  <option value="ALL">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left font-semibold px-5 py-4 w-12">#</th>
                    <th className="text-left font-semibold px-5 py-4">Branch Name</th>
                    <th className="text-left font-semibold px-5 py-4">Code</th>
                    <th className="text-left font-semibold px-5 py-4">City</th>
                    <th className="text-left font-semibold px-5 py-4">Trips</th>
                    <th className="text-left font-semibold px-5 py-4">Last Activity</th>
                    <th className="text-left font-semibold px-5 py-4">Status</th>
                    <th className="text-left font-semibold px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((b, idx) => {
                    const number = (safePage - 1) * pageSize + idx + 1;
                    const tripsCount = Number(b?.totalTrips ?? b?.trips?.length ?? 0);
                    const last = formatLastActivity(b);
                    return (
                      <tr key={b._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-gray-700">{number}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                              <BsBuildings size={18} />
                            </div>
                            <div className="font-medium text-gray-900">{b.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-700 font-medium">{b.code || "-"}</td>
                        <td className="px-5 py-4 text-gray-700">{b.city || "-"}</td>
                        <td className="px-5 py-4 text-gray-700">{tripsCount}</td>
                        <td className="px-5 py-4 text-gray-700">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-gray-300" />
                            <span>{last.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {b.isActive ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                              <span className="w-2 h-2 rounded-full bg-green-500" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                              <span className="w-2 h-2 rounded-full bg-red-500" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/agencies/${b._id}`)}
                              className="w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700"
                              title="View"
                            >
                              <MdRemoveRedEye />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/agencies/${b._id}`)}
                              className="w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700"
                              title="More"
                            >
                              <MdMoreVert />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                        No branches found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t bg-white">
              <div className="text-xs text-gray-500">
                Showing {showingFrom} to {showingTo} of {filteredBranches.length} branches
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className={`w-9 h-9 rounded-lg border text-sm ${
                    safePage <= 1 ? "text-gray-300 border-gray-200" : "text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ‹
                </button>
                <button className="w-9 h-9 rounded-lg border text-sm bg-blue-700 text-white border-blue-700">
                  {safePage}
                </button>
                <button
                  onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className={`w-9 h-9 rounded-lg border text-sm ${
                    safePage >= totalPages ? "text-gray-300 border-gray-200" : "text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Create Branch</DialogTitle>
        <DialogContent>
          <div className="m-1">
            {" "}
            <TextField
              label="Agent Login ID"
              fullWidth
              value={agentAuth?.loginId}
              onChange={(e) =>
                setAgentAuth((p) => ({ ...p, loginId: e.target.value }))
              }
              required
            />{" "}
          </div>{" "}
          <div className="m-1">
            {" "}
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={agentAuth?.password}
              onChange={(e) =>
                setAgentAuth((prev) => ({ ...prev, password: e.target.value }))
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {" "}
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {" "}
                      {showPassword ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}{" "}
                    </IconButton>{" "}
                  </InputAdornment>
                ),
              }}
            />{" "}
          </div>{" "}
          <hr className="my-4" />{" "}
          <div className="m-1">
            {" "}
            <TextField
              label="Agency Name"
              fullWidth
              id="agencyName"
              placeholder="Enter agency name here"
              value={branchForm.name}
              onChange={(event) =>
                setBranchForm((p) => ({ ...p, name: event.target.value }))
              }
              required
            />{" "}
          </div>{" "}
          <div className=" flex m-1 gap-4 ">
            {" "}
            <div>
              {" "}
              <div className="flex items-center ">
                {" "}
                <TextField
                  fullWidth
                  id="phone"
                  label="Service Area"
                  placeholder="Enter a service area"
                  value={newArea}
                  onChange={(event) => setNewArea(event.target.value)}
                  required
                />{" "}
              </div>{" "}
              <button
                onClick={handleAddArea}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-1 "
              >
                {" "}
                Add{" "}
              </button>{" "}
            </div>{" "}
            <div className=" overflow-y-auto bg-slate-200 m-2 rounded-sm w-48 h-auto ">
              {" "}
              {/* services areas */}{" "}
              {branchForm.serviceAreas.map((area, index) => (
                <span
                  key={index}
                  id="badge-dismiss-default"
                  className="inline-flex items-center m-1 px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-sm dark:bg-blue-900 dark:text-blue-300"
                >
                  {" "}
                  {area}{" "}
                  <button
                    onClick={() => {
                      handleRemoveArea(index);
                    }}
                    type="button"
                    className="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-xs hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                    data-dismiss-target="#badge-dismiss-default"
                    aria-label="Remove"
                  >
                    {" "}
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
            </div>{" "}
          </div>{" "}
          <div className="m-1"> {" "}
            <Select
              fullWidth
              value={branchForm.type || ""}  
              onChange={(event) =>
                handleOnChangeInputFormData("type", event.target.value)
              } 
              displayEmpty
            >
              <MenuItem value="" disabled> -- Select Role -- </MenuItem>
              <MenuItem value="AGENT"> AGENT (default) </MenuItem>
              <MenuItem value="OWN"> OWN </MenuItem>
              
            </Select>{" "}
          </div>
          <div>
            <TextField
              fullWidth
              label="Branch Code"
              id="code"
              placeholder="Enter branch code ex:Sri rama transports = SRT" 
              value={branchForm.code}
              onChange={(event) =>
                handleOnChangeInputFormData("code", event.target.value)
              }
              required
            />
          </div>
          <div className="m-1">
            {" "}
            <TextField
              fullWidth
              label="Phone Number"
              id="phone"
              placeholder="Enter agency phone number"
              value={branchForm.phone}
              onChange={(event) =>
                handleOnChangeInputFormData("phone", event.target.value)
              }
              required
            />{" "}
          </div>{" "}
          <div className="m-1">
            {" "}
            <TextField
              fullWidth
              label="City"
              id="agencyName"
              placeholder="Enter city name"
              value={branchForm.city}
              onChange={(event) =>
                handleOnChangeInputFormData("city", event.target.value)
              }
              required
            />{" "}
          </div>{" "}
          
           
          
          <div className="m-1">
            {" "}
            <TextField
              fullWidth
              label="Address"
              id="agencyName"
              placeholder="Ex:flat.No,:-10/42 Landmark"
              value={branchForm.address}
              onChange={(event) =>
                handleOnChangeInputFormData("address", event.target.value)
              }
              required
            />{" "}
          </div>{" "}
          
         
          <div className="mt-4">
            {" "}
            <div className="flex justify-end gap-2 ">
              {" "}
              <button
                className="px-4 py-2 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200 "
                onClick={onCancelForm}
              >
                {" "}
                cancel{" "}
              </button>{" "}
              <button
                className="px-4 py-2 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200"
                onClick={() => {
                  console.log(branchForm, agentAuth);
                  handleSubmit();
                }}
              >
                {" "}
                submit{" "}
              </button>{" "}
            </div>{" "}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default page;
