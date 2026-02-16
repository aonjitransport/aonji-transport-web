import React from "react";
import logo from "../../../../public/ANJITLOGOBLACK.svg"
import Image from "next/image";
import { LuHeartHandshake } from "react-icons/lu";

const BillComponent = ({ billData }) => {
  const date = new Date();
  console.log("bill data component",billData);
  


  return (
    <div className="flex justify-center items-center my-6 px-4">
      <div className="bg-slate-50 w-full  max-w-4xl border p-4 border-slate-200 rounded-lg shadow-lg">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center gap-4 px-2">
          {/* Header Section group 1 */}
          <div className="bg-slate-800 text-white  p-3 rounded-md text-center">
            <p className="text-2xl sm:text-3xl font-bebas font-semibold tracking-widest  ">
              AONJI
            </p>
            <p className=" font-bebas leading-none text-sm sm:text-base tracking-widest ">TRANSPORT</p>
          </div>
        {/* Header Section group 2 */}
          <div className="  text-base md:text-base font-bebas text-gray-700 leading-tight">
            <p>GST: jksdfujowieefiu</p>
            <p>Near New RTC Bus Stand, Proddatur,</p>
            <p>Kadapa Dist., 516360.</p>
            <p>Phone: 9898989898</p>
          </div  >

            {/* Header Section group 3 */}
          <div className="text-sm sm:text-base font-bebas text-gray-700 leading-tight">
            <p>Our Services To:</p>
            <p>Anantapur</p>
            <p>Kadapa</p>
            <p>Kurnool</p>
          </div>
          {/* Header Section group 4 */}
          <div className="flex flex-col items-center sm:items-start text-sm sm:text-base font-bebas text-gray-700">
            <p className="flex items-center gap-1 text-lg md:text-xl ">
              Thank you for choosing us! <LuHeartHandshake size={20} />
            </p>
            <p>For safety, security, and fast delivery.</p>
            <p className="text-sm ">
              Note: Report undelivered packages within 3 months.
            </p>
            <p className="text-sm ">We are not responsible afterward.</p>
          </div>
            {/* Header Section group 5 */}
            <Image src={logo} className="w-36    " alt="logo" />
          
          
        </div>

        <hr className="my-4 border-gray-300" />

        {/* Bill Content Section */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-roboto mx-2">
            <div className="flex justify-between text-base">
              <p>LR NO.: { billData?.lrNumber}</p>
              <p>DATE: {date.toLocaleDateString("hi-IN")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div className="border p-3 rounded-lg">
                <p>From: Proddatur</p>
                <p>Phone: 9898989898</p>
                <p>Total Lot: 5</p>
              </div>

              <div className="border p-3 rounded-lg">
                <p>To: {billData?.to}</p>
                <p>Agency: {billData?.agency?.name}</p>
                <p>Phone: {billData?.agency?.phone}</p>
              </div>

              <div className="border p-3 rounded-lg">
                <p>Consigner: {billData?.consigner?.name}</p>
                <p>Phone: {billData?.consigner?.phone}</p>
                <p>Address: {billData?.consigner?.address}</p>
                <p className="font-bold">
                  Total Amount: <span>₹</span> {billData?.totalAmount}/-
                  {billData?.paymentStatus ? <span> Paid</span> : <span> To Pay</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="relative overflow-x-auto mt-4">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-sm uppercase bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">NO.</th>
                  <th className="px-3 py-2">Consignee</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Lot</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Address</th>
                </tr>
              </thead>
              <tbody>
                {billData.consignees.map((item, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {item?.name}
                    </td>
                    <td className="px-3 py-2">{item?.phone}</td>
                    <td className="px-3 py-2">{item?.numOfParcels}</td>
                    <td className="px-3 py-2">{item?.type}</td>
                    <td className="px-3 py-2">₹{item?.amount}</td>
                    <td className="px-3 py-2">{item?.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillComponent;
