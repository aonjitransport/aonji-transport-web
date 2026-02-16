"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import Link from "next/link";

ModuleRegistry.registerModules([AllCommunityModule]);

const months = [
  "january",
  "febrauary",
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

function getYears(startYear = 2020) {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
}

export default function CustomerBillsPage() {
  const gridRef = useRef(null);

  const dateObj = new Date();

  const [years] = useState(getYears());
  const [areas, setAreas] = useState([]);

  const [filters, setFilters] = useState({
    month: months[dateObj.getMonth()],
    year: dateObj.getFullYear(),
    to: "",
  });

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);

  // 🔹 Fetch bills using existing API
  const fetchBills = async () => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/bills?${params}`);
    const data = await res.json();
    setBills(data || []);
    setLoading(false);
  };

  // 🔹 Fetch on filter change
  useEffect(() => {
    fetchBills();
  }, [filters.month, filters.year, filters.to]);

  // 🔹 Extract unique areas from bills
  useEffect(() => {
    const uniqueAreas = Array.from(
      new Set((bills || []).map(b => b.to).filter(Boolean))
    );
    setAreas(uniqueAreas);
  }, [bills]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "LR No",
        field: "lrNumber",
        width: 130,
        sortable: true,
      },
      {
        headerName: "Date",
        field: "date",
        width: 120,
      },
      {
        headerName: "To",
        field: "to",
        width: 150,
      },
      {
        headerName: "Consigner",
        valueGetter: p => p.data?.consigner?.name || "N/A",
        wrapText: true,
        autoHeight: true,
        width: 300,
      },
      {
        headerName: "Consignees",
        valueGetter: p =>
          p.data?.consignees?.map(c => c.name).join(", ") || "N/A",
        wrapText: true,
        autoHeight: true,
        width: 300,
      },
      {
        headerName: "Parcels",
        field: "totalNumOfParcels",
        width: 100,
      },
      {
        headerName: "Amount",
        field: "totalAmount",
        width: 130,
        valueFormatter: p => `₹${Number(p.value || 0).toFixed(2)}`,
      },
      {
        headerName: "Delivery",
        field: "deliveryStatus",
        width: 110,
        cellRenderer: p =>
          p.value ? (
            <span className="text-green-600 font-bold">✓</span>
          ) : (
            <span className="text-red-600 font-bold">✗</span>
          ),
      },
      {
        headerName: "View LR",
        field: "_id",
        width : 150,
        cellRenderer: params => (
          <Link
            href={`/bills/${params.value}`}
            className="text-blue-600 underline"
          >
            View
          </Link>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        Loading bills...
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 🔹 Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FormControl size="small">
          <InputLabel>Month</InputLabel>
          <Select
            value={filters.month}
            label="Month"
            onChange={e =>
              setFilters(prev => ({ ...prev, month: e.target.value }))
            }
          >
            {months.map(m => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Year</InputLabel>
          <Select
            value={filters.year}
            label="Year"
            onChange={e =>
              setFilters(prev => ({ ...prev, year: e.target.value }))
            }
          >
            {years.map(y => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Destination</InputLabel>
          <Select
            value={filters?.to}
            label="Destination"
            onChange={e =>
              setFilters(prev => ({ ...prev, to: e.target.value }))
            }
          >
            <MenuItem value="">All</MenuItem>
            {areas.map(a => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* 🔹 Bills Table */}
      <div className="ag-theme-alpine w-full" style={{ height: 600 }}>
        <AgGridReact
          ref={gridRef}
          rowData={bills}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={20}
          suppressCellFocus
           theme="legacy"   // ✅ FIX
        />
      </div>
    </div>
  );
}
