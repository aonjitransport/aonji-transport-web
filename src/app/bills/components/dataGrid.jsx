"use client";

import React from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import items from "../../../../../db.json"
import { useState } from 'react';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const DataGrid = () => {
   

    const [rowData, setRowData] = useState(items);

    const [colDefs, setColDefs] = useState([ 
        { headerName: "ID", field: "id" },
        { headerName: "Consinger Name", field: "consigner" },
        { headerName: "Consingee Name", field: "consignee" },
        { headerName: "Price", field: "amount" },])
  return (
    <div>
      <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
        <AgGridReact
          rowData={rowData} // Pass the server-fetched data here
          columnDefs={colDefs}
        />
      </div>
    </div>
  );
};

export default DataGrid;
