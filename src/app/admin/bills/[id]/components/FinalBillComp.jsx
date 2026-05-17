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
                    <p> <span className='font-Courier_Prime  text-gray-700 ' >  {billData?.fromBranch?.name}</span></p>
                    <p>From: <span className='font-Courier_Prime font-light text-gray-700 ' >  {billData?.fromBranch?.city}</span></p>
                    <p>Phone: <span className='font-Courier_Prime font-light text-gray-700 ' >{billData?.fromBranch?.phone}</span>  </p>
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


        {/* Receiver Signature + Terms & Conditions */}
        <div className="flex mt-3 border border-gray-200 rounded-lg overflow-hidden bg-white">
          
          {/* Left: Receiver Signature */}
          <div className="w-2/5 p-4 border-r border-gray-200 flex flex-col justify-between">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Receiver's Signature</p>
                <p className="text-xs text-gray-500 mt-0.5">Received the above goods in good condition.</p>
              </div>
            </div>

            {/* Signature line */}
            <div className="mt-8 mb-4">
              <div className="border-b border-dashed border-gray-400 w-full h-8"></div>
            </div>

            <div className="flex gap-6 text-xs text-gray-600 mt-1">
              <span>Name: _______________</span>
              <span>Date: _______________</span>
            </div>
          </div>

          {/* Right: Terms & Conditions */}
          <div className="w-3/5 p-4 bg-blue-50">
            <p className="text-sm font-bold text-gray-800 mb-2">Terms &amp; Conditions</p>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-outside pl-4">
              <li>By signing above, the receiver acknowledges that the goods have been received in good order and condition, as per the details mentioned in this Lorry Receipt.</li>
              <li>In case of any damage, shortage, or discrepancy, the same must be reported in writing to our office within 3 (three) months from the date of shipment.</li>
              <li>Claims raised after the above period shall not be entertained.</li>
              <li>Aonji Express Logistics Services shall not be held responsible for any delay, damage, shortage, or loss beyond the stipulated period.</li>
            </ul>
          </div>

        </div>


      </div>




                
       </div>

   
    </>
  )
}

export default FinalBillComp