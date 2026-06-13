"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useBillsStore from "../../../../store/billsStore";
import { Button } from "@mui/material";

import FinalBillComp from "./components/FinalBillComp"


import { pdf } from "@react-pdf/renderer";

import BillPdfDocument from "../../invoice-section/components/BillPdfDocument";




const BillPage = () => {
    const { id } = useParams();
    const router = useRouter();
   const { bill, prevId, nextId, fetchBill, loading } = useBillsStore();

    const [billPdfUrl, setBillPdfUrl] = useState("");
    const [billPdfLoading, setBillPdfLoading] = useState(false);
    const [billPdfError, setBillPdfError] = useState("");

    console.log(bill)
  
    useEffect(() => {
      if (id) {
        fetchBill(id);
        console.log("prev",prevId,nextId)
      }
    }, [id]);

    useEffect(() => {
      if (!bill) {
        setBillPdfUrl("");
        setBillPdfLoading(false);
        setBillPdfError("");
        return;
      }

      let cancelled = false;
      let generatedUrl = "";

      const prepareBillPdf = async () => {
        setBillPdfLoading(true);
        setBillPdfError("");
        setBillPdfUrl("");

        try {
          const blob = await pdf(<BillPdfDocument bill={bill} />).toBlob();
          generatedUrl = URL.createObjectURL(blob);

          if (cancelled) {
            URL.revokeObjectURL(generatedUrl);
            return;
          }

          setBillPdfUrl(generatedUrl);
        } catch (error) {
          console.error("Error preparing bill PDF:", error);
          if (!cancelled) {
            setBillPdfError("Unable to prepare bill PDF. Please try again.");
          }
        } finally {
          if (!cancelled) {
            setBillPdfLoading(false);
          }
        }
      };

      prepareBillPdf();

      return () => {
        cancelled = true;
        if (generatedUrl) {
          URL.revokeObjectURL(generatedUrl);
        }
      };
    }, [bill]);
  
    if (loading||!bill) return <p>Loading...</p>;
  
    const handlePrev = () => {
  if (prevId) {
    router.push(`/admin/bills/${prevId}`);
  }
};

const handleNext = () => {
  console.log("prev",prevId,nextId)
  if (nextId) {
    router.push(`/admin/bills/${nextId}`);
  }
};

  


    const handleBillPrint = () => {
      if (!billPdfUrl) return;

      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      printFrame.src = billPdfUrl;

      const removePrintFrame = () => {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      };

      printFrame.onload = () => {
        const printWindow = printFrame.contentWindow;
        printWindow?.focus();
        printWindow?.print();
        if (printWindow) {
          printWindow.onafterprint = removePrintFrame;
        }
        setTimeout(removePrintFrame, 60000);
      };

      document.body.appendChild(printFrame);
    };


   
  
    
    
  
   
    return (
      <>
      <div key={id}>


          


        <div className="m-3 flex justify-end gap-1 print:hidden ">
        <div>
          <Button onClick={handleBillPrint} disabled={billPdfLoading || !billPdfUrl}>
            {billPdfLoading ? "Preparing PDF..." : "Print"}
          </Button>
        </div>
        <div>
          <Button
            component="a"
            href={billPdfUrl || undefined}
            download={`bill_${bill?.lrNumber || "bill"}.pdf`}
            disabled={billPdfLoading || !billPdfUrl}
          >
            {billPdfLoading ? "Preparing PDF..." : "Download PDF"}
          </Button>
        </div>
          <button
            className={`px-4 py-2 rounded ${
              prevId? "bg-black text-white cursor-pointer ":" bg-gray-400 text-gray-700 cursor-not-allowed "
            }`}
            disabled={!prevId}
            onClick={ handlePrev}
          >
            ⬅ Prev
          </button>
  
          <button
            className={`px-4 py-2 rounded ${
              nextId? "bg-black text-white cursor-pointer ":"  bg-gray-400 text-gray-700 cursor-not-allowed "
            }`}
            disabled={!nextId}
            onClick={ handleNext}
          >
            Next ➡
          </button>
        </div>
        {billPdfError && (
          <p className="m-3 text-right text-sm text-red-600 print:hidden">
            {billPdfError}
          </p>
        )}

          <div className="flex flex-col items-center p-4">
      {/* Screen-only: show just once */}
      <div className="screen-only scale-[35%] md:scale-50 lg:scale-100 ">
        <FinalBillComp billData={bill} />
      </div>

    

     
    </div>
       
        
      
  
      </div>
          
         


</>
    );
  };

export default BillPage;
