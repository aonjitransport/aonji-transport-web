"use client";
import React from "react";
import Link from "next/link";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdListAlt } from "react-icons/md";
import { BsBuildingFillAdd } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import { TbCashRegister } from "react-icons/tb";
import { FaClipboardList } from "react-icons/fa6";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";  


const Dashbord = () => {
  const role = useAuthStore((s) => s.user?.role);
  const branchId = useAuthStore((s) => s.user?.branchId);

  const [userBranch, setUserBranch] = useState(null);

  
    /* ───────────── load user's branch ───────────── */
    useEffect(() => {
      
      if (branchId) {
        const fetchUserBranch = async () => { 
          try {
            const res = await fetch(`/api/branches/${branchId}`, {
              method: "GET",  
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            const data = await res.json();  
            if (res.ok) {
              console.log("User's branch loaded:", data);
              setUserBranch(data);
            } else {
              console.error("Failed to load user's branch:", data.error);
            }   
          } catch (err) {
            console.error("Error loading user's branch:", err);
          } 
        };
        fetchUserBranch();
      } 
      
    }, [branchId]);
  

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4  m-5 lg:m-14 gap-5 lg:gap-24">
       {  role === "agent" || role === "admin" ? 

       ( <Link
          href="/admin/invoice-section"
          className=" flex flex-col justify-center items-center  h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl "
        >
          <LiaFileInvoiceSolid color="white" className=" w-20 lg:w-44 h-auto" />
          <div className="text-white  ">Invoice Console</div>
        </Link>): null}

        <Link
          href="/admin/bills"
          className=" flex flex-col justify-center items-center h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl "
        >
          <MdListAlt className="w-20 lg:w-44 h-auto " color="white" />

          <div className="text-white">Invoice List</div>
        </Link>

        {role === "super_admin" || role === "admin" ? (
          <Link
            href="/admin/agencies"
            className=" flex flex-col justify-center items-center h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl "
          >
            <FaPeopleGroup className=" w-20 lg:w-44 h-auto " color="white" />
            <div className="text-white">Agencies</div>
          </Link>
        ) : null}

        {role === "agent" ? (
          <Link
            href={`/admin/agencies/${userBranch?._id}`}
            className=" flex flex-col justify-center items-center h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl "
          >
            <TbCashRegister className=" w-20 lg:w-44 h-auto " color="white" />
            <div className="text-white">Load Statements</div>
          </Link>
        ) : null}

        <Link
          href="/admin/trips"
          className=" flex flex-col justify-center items-center h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl "
        >
          <FaClipboardList className=" w-20 lg:w-44 h-auto " color="white" />
          <div className="text-white">Trip Sheets</div>
        </Link>
      </div>
    </>
  );
};

export default Dashbord;
