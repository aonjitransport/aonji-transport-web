"use client";
import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import LoadStatementPdf from "../agencies/components/LoadStatementsPdf";
import  { useLoadStatementsStore } from "../../../store/useLoadStatementStore"

export default function PDFPreviewPage() {
    
 const loadStatements = useLoadStatementsStore( (state) => state.loadStatements );
 const loading = useLoadStatementsStore((state) => state.loading);

  console.log ("Load Statements in PDF Preview Page:", loadStatements);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <PDFViewer width="50%" height="50%">
        <LoadStatementPdf loadStatementData={loadStatements} loading={loading} />
      </PDFViewer>
    </div>
  );
}
