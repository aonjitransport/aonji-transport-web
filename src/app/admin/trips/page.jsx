"use client";
import React, { useRef, useEffect,useState, use } from "react";
import { AgGridReact } from "ag-grid-react";

import PDFBillListDocument from "../bills/components/PDFDocument/PDFBillListDocument";
import TripSheetPDFDocument from "./components/TripSheetPDFDocument"
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import useTripsStore from "../../../store/tripsStore";
import useBranchStore from "@/store/branchStore";
import { useAuthStore } from "../../../store/useAuthStore";

import { pdf } from "@react-pdf/renderer";
import {
  ModuleRegistry,
  ClientSideRowModelModule, // ✅ import this
} from "ag-grid-community"; // ✅ note: no AllCommunityModule anymore in v33+

// ✅ Register required module
ModuleRegistry.registerModules([ClientSideRowModelModule]);



// Utility function to get years from a starting year to the current year


function getYearsFromYearToCurrent(startYear) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
}

const Page = () => {
  const gridRef = useRef(null);
 
  const branches = useBranchStore((state) => state.branches);
  const fetchBranches = useBranchStore((state) => state.fetchBranches);
  const {trips , fetchTrips} = useTripsStore();
    const user = useAuthStore((state) => state.user);
      const fetchMe = useAuthStore((state) => state.fetchMe);
      const hasHydrated = useAuthStore((state) => state.hasHydrated);
      useEffect(() => {
      if (hasHydrated && !user) {
        fetchMe();
      }
      }, [hasHydrated, user, fetchMe]);
  
 
  const [years, setYears] = React.useState([])
  const [dateObj] = React.useState(new Date());

  const [reqBody, setReqBody] = React.useState({
    month: "",
    year: new Date().getFullYear(), // ✅ default current year
    branch: "",
  });

  const handleReqBodyInputChange = (field, value) => {
    setReqBody((prev) => ({
      ...prev,
      [field]: value,
    }));

    console.log("handleReqBodyInputChange:", field, value);
  };

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches, ]);

const downloadTripPDF = async (trip) => {
  const blob = await pdf(
    <TripSheetPDFDocument trip={trip} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trip-${trip.tripId}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const colDefs = [
    { headerName: "Trip ID", field: "tripId", sortable: true, filter: true },
    { headerName: "Date", field: "createdAt",
      valueFormatter: (p) => {
        const date = new Date(p.value);
        return date.toLocaleDateString("en-GB");
      },
      sortable: true, filter: true },  
    { headerName: "Branch", field: "destinationBranch.name", sortable: true, filter: true },
   
    { headerName: "Qty", field: "totalArticels", sortable: true, filter: true },
    { headerName: "Amount", field: "totalAmount", sortable: true, filter: true },
    { headerName: "unpaid", field: "totalUnpaidAmount", sortable: true, filter: true },
    { headerName: "Balance due", field: "netPayableAmount", sortable: true, filter: true },
    {
      headerName:"download PDF",
      field:"_id",
      width:140,
      cellRenderer: (params) => {
        return (
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => downloadTripPDF(params.data)}
      >
        Download
      </button>
         );
       },
    }

  ]

  
  const CustomNoRowsOverlay = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
      <h3>No bills found</h3>
      <p>Try adjusting your filters or add a new bill.</p>
    </div>
  );
};
  


  


  useEffect(() => {
    const newYears = getYearsFromYearToCurrent(2020);
    setYears(newYears);

    handleReqBodyInputChange("month", months[dateObj.getMonth()]);
    handleReqBodyInputChange("year", dateObj.getFullYear());
  }, []);

useEffect(() => {
  if (!user || branches.length === 0) return;

  if (user.role === "agent") {
    setReqBody((prev) => ({
      ...prev,
      branch: user.branchId
    }));
  }

  if (user.role === "admin") {
    setReqBody((prev) => ({
      ...prev,
      branch: user.branchId
    }));
  }

  if (user.role === "super_admin") {
    setReqBody((prev) => ({
      ...prev,
      branch: ""
    }));
  }

}, [user, branches]);

  // Month/year defaults
useEffect(() => {
  const months = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december",
  ];
  const now = new Date();
  handleReqBodyInputChange("month", months[now.getMonth()]);
  handleReqBodyInputChange("year", now.getFullYear());
}, []);

  console.log("reqBody:", reqBody);
  
  console.log("tripsStore:", trips);

  // ✅ Fetch trips only when all required filters are ready
useEffect(() => {
  if (reqBody.month && reqBody.year && reqBody.branch) {
    fetchTrips(reqBody);
  }
}, [reqBody.month, reqBody.year, reqBody.branch]);

  

  return (
    <>
      <div className="flex p-2 gap-2 justify-end align-top">
        {/* ✅ Controlled Select */}
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            labelId="year-label"
            value={reqBody.year} // ✅ always controlled
            onChange={(e) =>
              handleReqBodyInputChange("year", Number(e.target.value))
            }
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <Select
            labelId="month-label"
            value={reqBody.month} // ✅ always controlled
            onChange={(e) =>
              handleReqBodyInputChange("month", String(e.target.value))
            }
          >
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ✅ Controlled Autocomplete */}
        <Autocomplete
  disablePortal
  options={
    user?.role === "super_admin"
      ? [{ _id: "", name: "All Branches" }, ...branches]
      : branches
  }
  getOptionLabel={(option) => option.name}
  sx={{ width: 300 }}
  value={
    user?.role === "super_admin" && !reqBody.branch
      ? { _id: "", name: "All Branches" }
      : branches.find((b) => b._id === reqBody.branch) || null
  }
  onChange={(event, value) =>
    handleReqBodyInputChange("branch", value?._id || "")
  }
  disabled={user?.role === "agent"}   // 🔒 agent cannot change
  renderInput={(params) => (
    <TextField {...params} label="Branch" />
  )}
/>
      </div>

      <div
        className="ag-theme-alpine"
        style={{
          height: 600,
          width: "100%",
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={trips}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={20}
          noRowsOverlayComponent={CustomNoRowsOverlay}
        />
      </div>
    </>
  );
};

export default Page;
