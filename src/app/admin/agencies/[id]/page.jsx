// src/app/admin/agencies/[id]/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useLoadStatementsStore } from "../../../../store/useLoadStatementStore"; // ✅ new store


import { AgGridReact } from "ag-grid-react";
import useBranchStore from "../../../../store/branchStore";
import { Dialog,DialogActions,DialogContent,DialogTitle,TextField, } from "@mui/material";
import {Select,MenuItem} from "@mui/material";


import {
  ModuleRegistry,
  ClientSideRowModelModule, // ✅ import this
} from "ag-grid-community"; // ✅ note: no AllCommunityModule anymore in v33+

// ✅ Register required module
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const AgencyPage = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
   const fetchBranches = useBranchStore((s) => s.fetchBranches);
   const branches = useBranchStore((s) => s.branches);
    const fetchBranch = useBranchStore((s) => s.fetchBranchById); // ✅ new function to fetch single branch by ID
  
  const [generateLoadStatementsModal, setGenerateLoadStatementsModal] = useState(false);
  const [loadStatementPayload, setLoadStatementPayload] = useState({month:"", year:""});
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
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
  }, [branch, filters,]);

  if (!branch) return <p>Loading...</p>;

  // ✅ AG Grid columns
  const columnDefs = [
    { headerName: "LS ID", field: "loadStatementId", width: 160 },
    { headerName: "Month", field: "month", width: 120,

      valueFormatter: (p) => {
        const monthIndex = p.value;
        return months[monthIndex] || "N/A"; 
      }
     },
    { headerName: "Year", field: "year", width: 120 },
    {
      headerName: "Total Freight",
      field: "totalFreightAmount",
      width: 160,
      valueFormatter: (p) => `₹ ${p.value.toFixed(2)}`,
    },
    {
      headerName: "Balance Due",
      field: "balanceDue",
      width: 160,
      valueFormatter: (p) => `₹ ${p.value.toFixed(2)}`,
    },
    {
      headerName: "Status",
      field: "paymentStatus",
      width: 140,
      valueFormatter: (p) => (p.value ? "Closed" : "Pending"),
      cellStyle: (p) => ({
        color: p.value ? "green" : "red",
        fontWeight: "bold",
      }),
    },
    {
      headerName: "Action",
      field: "_id",
      width: 140,
      cellRenderer: (params) =>
        !params.data.paymentStatus ? (
          <button
            onClick={() => closeLoadStatement(params.data._id)}
            className="px-3 py-1 bg-green-600 text-white rounded cursor-pointer"
          >
            Close
          </button>
        ) : (
          "✓done"
        ),
    },
    {
      headerName:"download PDF",
      field:"_id",
      width:140,
      cellRenderer:(params) => (
        <a
          href={`/admin/load-statements/${params.data._id}/pdf-preview`}
          target="_blank"
          rel="noopener noreferrer" 
          className="px-3 py-1 bg-blue-600 text-white rounded caret-purple-700 cursor-pointer"
        >
          Download
        </a>
      ),
    }
  ];

  console.log(    "PAGE S", loadStatements, branch, filters,  );

  const handleOnchangeLoadStatementPayload = (e) => {
    const { name, value } = e.target;
    setLoadStatementPayload((prev) => ({  
      ...prev,
      [name]: value,
    }));
  }

  const generateLoadStatement = async () => {
    // Implement the logic to generate load statements for all trips of the agency
    console.log("Generating load statements for agency:", branch._id, "with payload:", loadStatementPayload);
    const response = await fetch(`/api/load-statements/generate/`, {
      method: "POST",
      body : JSON.stringify({ ...loadStatementPayload, branchId: branch._id }),
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
    
  }

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
      (_, index) => index !== indexToRemove
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
    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
      <h3>No statements found</h3>
      <p>Try adjusting your filters or add a new bill.</p>
    </div>
  );
};

  return (
    <>
      {/* Header Info */}
      <div className={`w-auto h-auto ${branch.isActive ? 'bg-blue-800' : 'bg-blue-300'}   m-2 gap-1 p-2 md:p-3 rounded-t-lg grid grid-cols-6`}>
        <div className="text-white font-bold col-span-2">
          <div className="text-xs md:text-3xl">{branch.name}</div>
          <div className="text-xs md:text-xl">{branch.city}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-lg col-span-1">
          <div>Trips</div>
          <div>{branch.trips?.length || 0}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-lg col-span-1">
          <div>Total Amount</div>
          <div>{branch?.totalTripAmount || "--"}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-lg col-span-1">
          <div>Our Share</div>
          <div>{branch?.totalCompanyEarnings || "--"}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-lg col-span-1">
          <div>Agent Share</div>
          <div>{branch?.totalAgencyEarnings || "--"}</div>
        </div>
      </div>

      {/* ✅ Load Statements Section */}
      <div className="w-auto bg-slate-100 border-2 border-gray-400 rounded-b-lg m-2 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Load Statements</h2>
          <button
            onClick={() => setGenerateLoadStatementsModal(!generateLoadStatementsModal)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Statements
          </button>
        </div>

        {/* ✅ Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
        
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: e.target.value })
              }
              className="border px-3 py-2 rounded"
            >
              {months?.map((m, i) => (
                <option key={i} value={m === "None" ? "" : m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
           
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="border px-3 py-2 rounded"
            >
              {years?.map((y, i) => (
                <option key={i} value={y === "None" ? "" : y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
          {loading ? (
            <p>Loading statements...</p>
          ) : (
            <AgGridReact
              rowData={loadStatements}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={15}
              noRowsOverlayComponent={CustomNoRowsOverlay} // ✅ custom no rows overlay
            />
          )}
        </div>
      </div>

      {/* Agency Info */}
      <div className="w-auto h-auto p-4 bg-slate-100 border-2 border-gray-400 rounded-b-lg m-2">
        <div className="flex justify-center md:justify-start">
          <div>
            <p className="font-bold text-2xl">Address & Info</p>
            <div className="text-xl">
              <p>Active status : {branch?.isActive ? "Active" : "Inactive"}</p>
              <p>City : {branch?.city}</p>
              <p>Phone : {branch?.phone}</p>
              <p>Code : {branch?.code}</p>
              <p>Service Areas : {branch?.serviceAreas?.join(", ")}</p>
             
            
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-5 text-xl">
          <div
            onClick={handleDeactivate}
            className={`${branch.isActive ? "text-rose-500" : "text-green-600"} hover:cursor-pointer hover:underline`}
          >
            {branch.isActive ? "Deactivate" : "Activate"}
          </div>
          <div 
            className="text-blue-500 hover:cursor-pointer hover:underline"
            onClick={ () => openEditAgency(branch) }
          >
            Edit
          </div>
        </div>
      </div>

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
            <p>Are you sure you want to generate load statements for all trips of {branch.name}?</p>
            <div className="mt-4">
              <label className="block mb-2 font-semibold">Month:</label>
              <Select fullWidth name="month" value={loadStatementPayload.month} onChange={handleOnchangeLoadStatementPayload}>
                {months?.slice(1)?.map((m, i) => (
                  <MenuItem key={i} value={m.toLowerCase()}>  
                    {m}
                  </MenuItem>
                ))} 
              </Select>
            </div>
            <div className="mt-4">  
              <label className="block mb-2 font-semibold">Year:</label>
              <Select fullWidth name="year" value={loadStatementPayload.year} onChange={handleOnchangeLoadStatementPayload}>
                {years?.slice(1)?.map((y, i) => ( 
                  <MenuItem key={i} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>} 
            {successMessage && <div className="text-green-600 mt-2">{successMessage}</div>}
              
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
        onClose={() => {  setEditAgencyModal(false); }} // Implement close handler 
      > 
        <DialogTitle className="font-bold text-xl">
          Edit Agency Info
        </DialogTitle>  
        <DialogContent>
        {/* Implement form fields to edit agency info */}
        <div className="m-2" >
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
