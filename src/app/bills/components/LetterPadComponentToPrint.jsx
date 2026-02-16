import React from 'react'
import logo from "../../../../../public/ANJITLOGOBLACK.svg"
import Image from 'next/image'


function LetterPadComponentToPrint() {
  return (
    <>
     <div className=" p-1 " >
        
        <div className=" text-black p-1 border-2 bg-slate-50  w-[794px] h-[1123px] "  >
          {/* header section */}
  
          <div className=" p-2  flex justify-between  " >
  
            <div className="text-xs font-sans font-semibold " >
                    <div  >
                       <p> Contact : 9989989898 </p>
                       <p> email : aonjiTransport@mail.com</p>
                    </div>
  
            </div>
  
            <div className='grid-cols-2'  >
                <div>
             <div className=" flex font-bebas font-bold text-5xl justify-center tracking-[8px] leading-none p-0 m-0 " >AONJI</div>
            
             <div className='flex text-xs justify-center font-sans font-bold leading-none tracking-[6px] p-0 m-0 mr-[2px] ' >TRANSPORT</div>
             </div>
             <div className='flex justify-center text-xs font-bold mt-4 ' > Beside New RTC Bustand proddatur,516360. </div>
             <div className='flex justify-center' >(letter pad)</div>
  
            </div>
  
            <div className="w-[178.8px] " >
                <div className='flex justify-end' >
                <Image  src={logo}  alt='logo' width={100}   />
                </div>
  
            </div>

  
          </div>
            <div className='bg-black w-full h-[2px] ' ></div>
            <div className='flex justify-between  ' > 
                <div className='flex gap-2' >
                <div>Agency name:</div>
                <div>Driver's name:</div>
                </div>
                <div>Date: </div>
            </div>
  
        </div>
        {/* list table here */}
        


        </div>
  
  
      
    
    </>
  )
}

export default LetterPadComponentToPrint