import React from 'react'
import dynamic from "next/dynamic";
import PDFViewr from "../PDFViewer/PDFViewer"
import PDFDocument from "../PDFDocument/PDFBillDocument"


const PDFViewer = dynamic( () => import( "../PDFViewer/PDFViewer" ), {
    loading: () => <div>Loading...</div>,
    ssr: false
  } );




const PDFBillPage = ({billData}) => {
  return (
   
    <div className=" flex justify-center align-middle w-full h-[750px] " >
            <PDFViewer width="100%" height="100%" >
                <PDFDocument bill={billData} />
            </PDFViewer>

    </div>
  )
}

export default PDFBillPage