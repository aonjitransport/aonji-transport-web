import React, { forwardRef } from "react";

const A4DocumentToPrint = forwardRef((props, ref,billListData=[],charges) => {
  return (
    <div ref={ref} className=" m-2" >
     
     <div className="bg-black w-full h-20 flex justify-between " >

      {/* <div className="bg-slate-600 w-9 h-auto p-1 m-2 " >

      </div>

      <div className="bg-slate-600 w-9 h-auto p-1 m-2 " >

      </div>
s
      <div className="bg-slate-600 w-9 h-auto p-1 m-2 " >

      </div> */}

     <p className="text-white" >hello test</p>


     </div>

    </div>
  );
});

export default A4DocumentToPrint;