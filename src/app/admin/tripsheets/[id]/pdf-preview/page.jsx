"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PDFViewer } from "@react-pdf/renderer";
import TripSheetPDFDocument from "../../components/TripSheetPdfDocument"

export default function PDFPreviewPage() {
  const { id } = useParams();
  const [tripSheet,setTripSheet] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!id) return;
  fetch(`/api/trips/${id}`)
    .then(res => res.json())
    .then(data => setTripSheet(data))
    .catch(err => console.error("Error fetching load statement:", err))
    .finally(() => setLoading(false));
   
}, [id]);

  console.log("Load Statement in PDF Preview Page:", tripSheet);

  if (loading) return <p>Loading PDF...</p>;
  if (!tripSheet) return <p>No data found.</p>;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <PDFViewer width="100%" height="100%">
        <TripSheetPDFDocument trip={tripSheet} />
      </PDFViewer>
    </div>
  );
}
