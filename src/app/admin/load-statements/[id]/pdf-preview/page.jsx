"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PDFViewer } from "@react-pdf/renderer";
import LoadStatementPdf from "../../../agencies/components/LoadStatementsPdf"

export default function PDFPreviewPage() {
  const { id } = useParams();
  const [loadStatement, setLoadStatement] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!id) return;
  fetch(`/api/load-statements/${id}`)
    .then(res => res.json())
    .then(data => setLoadStatement(data))
    .catch(err => console.error("Error fetching load statement:", err))
    .finally(() => setLoading(false));
   
}, [id]);

  console.log("Load Statement in PDF Preview Page:", loadStatement);

  if (loading) return <p>Loading PDF...</p>;
  if (!loadStatement) return <p>No data found.</p>;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <PDFViewer width="100%" height="100%">
        <LoadStatementPdf loadStatementData={loadStatement} />
      </PDFViewer>
    </div>
  );
}
