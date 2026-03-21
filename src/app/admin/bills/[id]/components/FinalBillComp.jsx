import React from 'react'
import hanumanLogo from "../../../../../../public/hanumanlogo.png"
import { LuHeartHandshake } from "react-icons/lu";
import brandLogo from "../../../../../../public/aonji-final-bw-logo.png"
import Image from 'next/image'

function FinalBillComp({billData}) {
    const date = new Date
  return (
    <>
      <div className="flex flex-col justify-center p-1  " >

           
      <div className="bg-gray-100 w-[794px] h-auto  border p-2 border-slate-200 rounded-lg   " >
        {/* header */}
        <div className='bg-slate-800 w-full p-[2px] text-center   justify-center text-white font-bold  text-lg ' >Lorry Receipt (LR)</div>
        <div className=" flex justify-between items-center " >

          <div className=" p-2" > 
            <Image src={hanumanLogo} className="w-10 h-auto " alt="img" />
             </div>
          
         

              <div className="font-bebas tracking-wide text-sm  " >
                <p>GST:jjiiejedsg</p>
                <p>Near new RTC Bustand,Proddatur,</p>
                <p>Kadapa Dist.,516360.</p>
                <p>Phone:9898989898</p>
              </div>

          

              <div className="font-bebas self-start " >
                <p className="flex text-2xl items-center gap-1 " >THANK YOU FOR CHOOSING US!<LuHeartHandshake className="mb-[2px]" size={18} /> </p>
                <p>Our mission is to deliver your packages <br /> safely, securely, and on time.</p>
              </div>

              




            <div className="self-end mb-1 mr-1  " > 
            <Image src={brandLogo} className="w-40 h-auto" alt="img" />
             </div>

        
        
        </div>
            
           
          
         <div className="  p-1 rounded-md bg-white mt-2    " >
              <div className="flex justify-between font-roboto px-4 " >
                <p>Invoice No.: {billData?.lrNumber} </p>
                  <p>Date:{date.toLocaleDateString("hi-IN")}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 px-4 justify-between  " >

                <div className="border p-2 text-xs font-semibold border-gray-300 rounded-md  " >
                    <p>From: <span className='font-Courier_Prime font-light text-gray-700 ' > proddatur</span></p>
                    <p>Phone: <span className='font-Courier_Prime font-light text-gray-700 ' >9540959405</span>  </p>
                    <p>Total Lot: <span className='font-Courier_Prime font-light text-gray-700 ' >{billData.totalNumOfParcels}</span>  </p>
                </div>

                 <div className="border  text-xs p-2 font-semibold border-gray-300 rounded-md  " >
                    <p>To: <span className='font-Courier_Prime font-light text-gray-700 ' >{billData?.to}</span> </p>
                    <p>Agency: <span className='font-Courier_Prime font-light text-gray-700 '>{billData?.toBranch?.name}</span> </p>
                    <p>Phone: <span className='font-Courier_Prime font-light text-gray-700 '>{billData?.toBranch?.phone}</span>  </p>
                </div>

                 <div className="border text-xs p-2 font-semibold border-gray-300 rounded-md  " >
                    <p>Consigner: <span className='font-Courier_Prime font-light text-gray-700 ' > {billData?.consigner?.name}</span> </p>
                    <p>Phone: <span className='font-Courier_Prime font-light text-gray-700 '>{billData?.consigner?.phone}</span>  </p>
                    <p>Address: <span className='font-Courier_Prime font-light text-gray-700 '>{billData?.consigner?.address}</span>  </p>
                    <p className="font-bold">
                  Total Amount: <span className='font-Courier_Prime font-light text-gray-700 '>₹{billData.totalAmount}/-</span>
                 
                </p>
                <div className='flex justify-start' >
                <p className='mr-2 font-sans font-bold bg-gray-600 p-1 text-xs text-white rounded-sm  ' >
                   {billData.paymentStatus ? <span> Paid</span> : <span> To pay</span>}
                </p>
                </div>
                </div>

          

              </div>

            

                     {/* Table Section */}
            <div className='px-4 mt-2 ' >
          <div className="relative overflow-x-auto w-full  ">
            <table className=" text-sm text-left w-full text-gray-700">
              <thead className="text-sm uppercase bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">NO.</th>
                  <th className="px-3 py-2">Consignee</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Address</th>
                </tr>
              </thead>
              <tbody className='font-Courier_Prime'  >
                {billData.consignees.map((item, index) => (
                  <tr key={index} className="bg-white  border-b">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2  ">
                      {item.name}
                    </td>
                    <td className="px-3 py-2">{item.phone}</td>
                    <td className="px-3 py-2">{item.numOfParcels}</td>
                    <td className="px-3 py-2">{item.type}</td>
                    <td className="px-3 py-2">₹{item.amount}</td>
                    <td className="px-3 py-2">{item.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>


        </div>


              <div className=' flex justify-between px-1 text-xs mt-6 ' >
                <p>issued by: {billData?.createdBy?.name}</p>
                <p>Generated on: {new Date(billData.createdAt).toLocaleString("hi-IN")}</p>
                  

              </div>

              <div>
                <p className='text-center text-xs text-gray-500' >Note: Report undelivered packages within 3 months.</p>
              </div>


      </div>




                
       </div>

   
    </>
  )
}

export default FinalBillComp