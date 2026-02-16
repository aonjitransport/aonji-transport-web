"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useBillsStore from "../../../store/billsStore"
import Lottie from "lottie-react";
import BillComponent from "../components/BillComponent";
import dynamic from "next/dynamic";
import { Modal,Button } from "flowbite-react";
import {loadingAnimationData} from "../../../../public/assets/animations/aonjiLoading.json"

import { useRef } from "react";


import PDFBillPage from "../components/PDFViewer/PDFBillPage";
import { Dialog,DialogActions,DialogContent,DialogTitle } from "@mui/material";
import { useBreakpoint } from "../../bills/hooks/useBreakPoint"





const BillPage = () => {

    const {isMobile} = useBreakpoint();
    const { id } = useParams();
    const router = useRouter();
    const { bill, prevId, nextId, fetchBill, loading } = useBillsStore();
    const [openModal, setOpenModal] = useState(false);
    

    const handleBillPrint = ()=>{
        setOpenModal(!openModal)
    }
    console.log(bill)
  
  useEffect(() => {
  
     if (id) {
        fetchBill(id);
        console.log("prev",prevId,nextId)
      }
  
}, [id]);

  const handlePrev = () => {
  if (prevId) {
    router.push(`/admin/bills/${prevId}`);
  }
}

const handleNext = () => {
  console.log("prev",prevId,nextId)
  if (nextId) {
    router.push(`/admin/bills/${nextId}`);
  }
};

  
   
  
      if (loading||!bill ) {
    return <div className="w-full h-[calc(100vh-62px)] gap-5 flex flex-col justify-center items-center"  >
    <div className=" flex   justify-center items-center" >
            <Lottie
            animationData={loadingAnimationData}
            loop={true}
            className="flex justify-center items-center w-64 h-auto lg:w-[484px] lg:h-auto "
            alt="loading"
            
            />
      </div>
      <div>
        Loading...
      </div>
    </div>
       // You can replace this with a spinner or fallback UI
  }
  
    
   

   
  
   
  
   
  
    return (
      <div key={id}>


          
       

        <div className="m-3 flex justify-end gap-1">
        <div>
          <button onClick={handleBillPrint} className="bg-black text-white px-4 py-2 rounded">Print</button>
        </div>
        
             <button
              className={`px-4 py-2 rounded ${
              prevId? "bg-black text-white cursor-pointer ":" bg-gray-400 text-gray-700 cursor-not-allowed "
            }`}
                disabled={!prevId}
              
            
              onClick={handlePrev}
            >
              ⬅ Prev
            </button> 
  
          <button
            className={`px-4 py-2 rounded ${
              nextId? "bg-black text-white cursor-pointer ":" bg-gray-400 text-gray-700 cursor-not-allowed "
            }` }
              disabled={!nextId}  
            
            
            onClick={handleNext }
          >
            Next ➡
          </button> 

        </div>

          
            
             
          <BillComponent billData={bill} />
             
          

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

    );
  };

export default BillPage;
