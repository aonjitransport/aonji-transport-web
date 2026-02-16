"use client";

import { useEffect, useState,useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useBillsStore from "../../../../store/billsStore";
import logo from "../../../../../public/ANJITLOGOBLACK.svg"

import jsPDF from 'jspdf'
import hanumanLogo from "../../../../../public/hanumanlogo.png"
import { LuHeartHandshake } from "react-icons/lu";
import { useBreakpoint } from "../../../../app/bills/hooks/useBreakPoint"
import brandLogo from "../../../../../public/assets/footerlogo.svg"
import { Dialog,DialogActions,DialogContent,DialogTitle,Button } from "@mui/material";

import FinalBillComp from "./components/FinalBillComp"

import PDFBillPage from "../components/PDFViewer/PDFBillPage";




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
       

        <Dialog  fullWidth={true}

        maxWidth={isMobile?"xs":"lg"} open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Print Bill</DialogTitle>
        <DialogContent>
              <PDFBillPage billData={bill} />
        </DialogContent>
        <DialogActions>
         
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
