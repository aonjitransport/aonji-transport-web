import React from 'react'
import Link from 'next/link'
import { LiaFileInvoiceSolid,  } from "react-icons/lia";
import { MdListAlt } from "react-icons/md";
import { BsBuildingFillAdd } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import { TbCashRegister } from "react-icons/tb";
import { FaClipboardList } from "react-icons/fa6";

const Dashbord = () => {



  return (
    <>


      

        <div className='grid grid-cols-2 lg:grid-cols-4  m-5 lg:m-14 gap-5 lg:gap-24' >

         <Link href="/admin/invoice-section"  className=' flex flex-col justify-center items-center  h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl ' > 
                <LiaFileInvoiceSolid color='white' className=' w-20 lg:w-44 h-auto' />
                <div className='text-white  ' >Invoice Console</div>
         </Link>

         <Link href="/admin/bills"  className=' flex flex-col justify-center items-center h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl ' >
            
            <MdListAlt className='w-20 lg:w-44 h-auto ' color='white' />

                    <div className='text-white' >Invoice List</div>
              </Link>

         <Link href="/admin/agencies"  className=' flex flex-col justify-center items-center h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl ' > 
            
         <FaPeopleGroup className=' w-20 lg:w-44 h-auto ' color='white' />
         <div className='text-white' >Agencies</div>

             </Link>



             <Link href="/admin/trips"  className=' flex flex-col justify-center items-center h-64 w-auto lg:h-72 bg-blue-900 shadow-md hover:shadow-2xl lg:rounded-2xl rounded-xl ' > 
            
            <FaClipboardList className=' w-20 lg:w-44 h-auto ' color='white' />
            <div className='text-white' >Trip Sheets</div>
   
                </Link>

             

                       
        </div>





    </>
  )
}

export default Dashbord