"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  useAgencyStore,
  useAgencyDeleteModal,
  useAgencyEditModal,
} from "../../../../store/agencyStore";
import { useLoadStatementsStore } from "../../../../store/useLoadStatementStore"; // ✅ new store
import AgencyDeleteModal from "../components/AgencyDeleteModal";
import AgencyEditModal from "../components/AgencyEditModal";
import { AgGridReact } from "ag-grid-react";



import {
  ModuleRegistry,
  ClientSideRowModelModule, // ✅ import this
} from "ag-grid-community"; // ✅ note: no AllCommunityModule anymore in v33+

// ✅ Register required module
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const AgencyPage = () => {
  const { id } = useParams();
  const { agencies, fetchAgencies } = useAgencyStore();
  const { openModal } = useAgencyDeleteModal();
  const { openModal: openEditModal } = useAgencyEditModal();
  const [agency, setAgency] = useState(null);

  // ✅ Zustand store for load statements
  const {
    loadStatements,
    fetchLoadStatements,
    closeLoadStatement,
    generateLoadStatements,
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

  const years = ["Year", 2024, 2025, 2026, 2027];

  useEffect(() => {
    if (agencies.length === 0) {
      fetchAgencies();
    } else {
      const foundAgency = agencies.find((item) => item._id.toString() === id);
      setAgency(foundAgency);
    }
  }, [id, agencies, fetchAgencies]);

  // ✅ Fetch load statements when agency or filters change
  useEffect(() => {
    if (!agency?._id) return;
    fetchLoadStatements(agency._id, filters);
  }, [agency, filters]);

  if (!agency) return <p>Loading...</p>;

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

  console.log(    "PAGE S", loadStatements );

  return (
    <>
      {/* Header Info */}
      <div className="w-auto h-auto bg-blue-800 m-2 gap-1 p-2 md:p-3 rounded-t-lg grid grid-cols-6">
        <div className="text-white font-bold col-span-2">
          <div className="text-xs md:text-3xl">{agency.name}</div>
          <div className="text-xs md:text-xl">{agency.city}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-2xl col-span-1">
          <div>Trips</div>
          <div>{agency.trips?.length || 0}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-2xl col-span-1">
          <div>Amount</div>
          <div>{agency.amount}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-2xl col-span-1">
          <div>Our Share</div>
          <div>{}</div>
        </div>
        <div className="text-white font-bold text-xs md:text-2xl col-span-1">
          <div>Agent Share</div>
          <div>{agency.agentShare}</div>
        </div>
      </div>

      {/* ✅ Load Statements Section */}
      <div className="w-auto bg-slate-100 border-2 border-gray-400 rounded-b-lg m-2 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Load Statements</h2>
          <button
            onClick={generateLoadStatements}
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
                setFilters({ ...filters, month: e.target.value.toLowerCase() })
              }
              className="border px-3 py-2 rounded"
            >
              {months.map((m, i) => (
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
              {years.map((y, i) => (
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
              <p>Phone : {agency.phone}</p>
              <p>City : {agency.city}</p>
              <p>Street : {agency.street}</p>
              <p>District : {agency.district}</p>
              <p>State : {agency.state}</p>
              <p>Pincode : {agency.pincode}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-5 text-xl">
          <div
            onClick={() => openModal(agency.id)}
            className="text-rose-500 hover:cursor-pointer hover:underline"
          >
            Delete
          </div>
          <div
            onClick={() => openEditModal(agency)}
            className="text-blue-500 hover:cursor-pointer hover:underline"
          >
            Edit
          </div>
        </div>
      </div>

      <AgencyDeleteModal />
      <AgencyEditModal />
    </>
  );
};

export default AgencyPage;
