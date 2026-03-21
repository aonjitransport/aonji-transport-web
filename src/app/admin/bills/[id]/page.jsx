"use client";

import { useEffect, useState,useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useBillsStore from "../../../../store/billsStore";
import logo from "../../../../../public/ANJITLOGOBLACK.svg"

import jsPDF from 'jspdf'
import hanumanLogo from "../../../../../public/hanumanlogo.png"
import { LuHeartHandshake } from "react-icons/lu";
import { useBreakpoint } from "../hooks/useBreakPoint"
import brandLogo from "../../../../../public/assets/footerlogo.svg"
import { Dialog,DialogActions,DialogContent,DialogTitle,Button } from "@mui/material";

import FinalBillComp from "./components/FinalBillComp"

import PDFBillPage from "../components/PDFViewer/PDFBillPage";
import { pdf, PDFDownloadLink,PDFViewer } from "@react-pdf/renderer";

import BillPdfDocument from "../../invoice-section/components/BillPdfDocument";




const BillPage = () => {
  const printRef = useRef(null);
    const { id } = useParams();
    const router = useRouter();
   const { bill, prevId, nextId, fetchBill, loading } = useBillsStore();

    const [openModal, setOpenModal] = useState(false);

    const {isMobile} = useBreakpoint();

    
    console.log(bill)
  
   const date = new Date
  
    useEffect(() => {
      if (id) {
        fetchBill(id);
        console.log("prev",prevId,nextId)
      }
    }, [id]);
  
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

  


    const handleBillPrint =()=>{
      setOpenModal(!openModal)
    }


   
  
    
    
  
   
    return (
      <>
      <div key={id}>


          


        <div className="m-3 flex justify-end gap-1 print:hidden ">
        <div>
          <Button onClick={handleBillPrint} >Print</Button>
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

          <div className="flex flex-col items-center p-4">
      {/* Screen-only: show just once */}
      <div className="screen-only scale-[35%] md:scale-50 lg:scale-100 ">
        <FinalBillComp billData={bill} />
      </div>

    

     
    </div>
       

        <Dialog  
          fullWidth ={true}
          maxWidth="lg"
         open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Print Bill</DialogTitle>
         <DialogContent>
                  {/* PDF Preview Component */}
                {
                  loading ? (<p>Loading PDF...</p>
                  ) : (
                    <PDFViewer style={{ width: "100%", height: "80vh" }}>
                      <BillPdfDocument bill={bill} />
                    </PDFViewer>
                  )

                }
                </DialogContent>
       
        <DialogActions>
                  <PDFDownloadLink document={<BillPdfDocument bill={bill} />} fileName= {`bill_${bill?.lrNumber || "bill"}.pdf`} >
              {({ blob, url, loading, error }) => (
                <Button disabled={loading || error}>
                  {loading ? "Generating PDF..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
              
          <Button  onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
               

        
      
  
      </div>
          
         


</>
    );
  };

export default BillPage;
