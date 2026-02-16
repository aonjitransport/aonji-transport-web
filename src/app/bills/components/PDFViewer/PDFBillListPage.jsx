
import React from 'react'
import dynamic from "next/dynamic";
import PDFViewr from "./PDFViewer"
import PDFBillListDocument from "../PDFDocument/PDFBillListDocument"



const PDFViewer = dynamic( () => import( "./PDFViewer" ), {
    loading: () => <div>Loading...</div>,
    ssr: false
  } );


const PDFBillListPage = ({BillListData,charges}) => {
   
  return (
    <>

    <div className=" flex justify-center align-middle w-full h-[750px] " >
      
            <PDFViewer  width="100%" height="100%" >
              
                <PDFBillListDocument billListData={BillListData} charges={charges} />
               
            </PDFViewer>
            

    </div>

    </>
  )
}

export default PDFBillListPage