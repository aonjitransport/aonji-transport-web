"use client";
import { MdAddBusiness } from "react-icons/md";



import { useEffect, useState } from "react";
import Link from "next/link";
import { useAgencyStore } from "../../../store/agencyStore";
import AgencyCard from "@/components/AgencyCard";


import {Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { MdVisibility } from "react-icons/md";
import { MdVisibilityOff } from "react-icons/md";




const page = () => {

  const fetchAgencies = useAgencyStore((state)=>(state.fetchAgencies))
  const createAgency = useAgencyStore((state)=>(state.createAgency))
  const agencies = useAgencyStore((state)=>(state.agencies))
  const [newArea, setNewArea] = useState("");
  


  const [agencyFormData,setAgencyFormData]=useState({
    name:"",
    phone:"",
    city:"",
    district:"",
    serviceAreas:[],
    state:"",
    address:"",
    pincode:"",
  })

  const [agentAuth, setAgentAuth] = useState({
  loginId: "",
  password: "",
});

const [showPassword, setShowPassword] = useState(false);


  const [openModal,setOpenModal] =useState(false)



  useEffect(() => {

    fetchAgencies()
   
    
    
  }, []);

function onCancelForm() {
  setOpenModal(false);

  setAgencyFormData({
    name: "",
    phone: "",
    city: "",
    district: "",
    serviceAreas: [],
    state: "",
    address: "",
    pincode: "",
  });

  setAgentAuth({
    loginId: "",
    password: "",
  });

  setNewArea("");
}


    const handleAddArea = () => {
    const trimmed = newArea.trim();
    if (trimmed && !agencyFormData.serviceAreas.includes(trimmed)) {
      setAgencyFormData((prev) => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, trimmed],
      }));
      setNewArea("");
    }
  };
  
   const handleRemoveArea = (indexToRemove) => {
    setAgencyFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleOnChangeInputFormData = (name,value)=>{

    setAgencyFormData((prevState)=>({...prevState,[name]:value}))
     

  }
  const handleSubmit = async () => {
  if (!agentAuth.loginId || !agentAuth.password) {
    alert("Login ID and Password are required");
    return;
  }

  const payload = {
    loginId: agentAuth?.loginId,
    password: agentAuth?.password,
    agency: agencyFormData,
  };

  const res = await createAgency(payload);

  console.log("Agent created successfully", res);
  setOpenModal(false);
};


    const togglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
};





  return (
    <>
      <div className=" flex justify-end m-4 sticky top-16 ">
        <div className=" grid grid-flow-col  w-fit p-2 rounded-md  items-center bg-blue-900 shadow-2xl hover:cursor-pointer  ">
          <MdAddBusiness size={30} color="white" />
          <div
            className="text-white font-bold"
            onClick={() => {
              setOpenModal(true);
            }}
          >
            Add Agent
          </div>
        </div>
      </div>

      {agencies?.map((item, index) => (
        <div key={index}>
          <Link href={`/admin/agencies/${item?._id}/`}>
            <AgencyCard
              key={index}
              agencyName={item?.name}
              city={item?.city}
              amount={item?.amount}
              trips={item?.trips?.length || 0}
              ourShare={item?.ourShare}
              agentShare={item?.agentShare}
            />
          </Link>
        </div>
      ))}

      <Dialog
        open={openModal}
        size="md"
        onClose={() => {
          setOpenModal(false);
        }}
      >
        <DialogTitle>Add New Agency</DialogTitle>
        <DialogContent>

                          {/* 🔐 Agent Login Details */}
              <div className="m-1">
                <TextField
                  label="Agent Login ID"
                  fullWidth
                  value={agentAuth?.loginId}
                  onChange={(e) =>
                    setAgentAuth((p) => ({ ...p, loginId: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="m-1">
                <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        variant="outlined"
                        fullWidth
                        value={agentAuth?.password}
                        onChange={(e) =>
                          setAgentAuth((prev) => ({ ...prev, password: e.target.value }))
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={togglePasswordVisibility} edge="end">
                                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

              </div>

              <hr className="my-4" />

          
            <div className="m-1">
              <TextField
                label="Agency Name"
                fullWidth
                id="agencyName"
                placeholder="Enter agency name here"
                value={agencyFormData.name}
                onChange={(event) =>
                  handleOnChangeInputFormData("name", event.target.value)
                }
                required
              />
            </div>
         

          <div className=" flex m-1 gap-4   ">
            <div>
              <div className="flex items-center ">
                <TextField
                  fullWidth
                  id="phone"
                  label="Service Area"
                  placeholder="Enter a service area"
                  value={newArea}
                  onChange={(event) => setNewArea(event.target.value)}
                  required
                />
              </div>
              <button
                onClick={handleAddArea}
                type="button"
                className="text-white  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-1  "
              >
                Add
              </button>
            </div>

            <div className=" overflow-y-auto bg-slate-200 m-2 rounded-sm w-48 h-auto  ">
              {/* services areas  */}

              {agencyFormData.serviceAreas.map((area, index) => (
                <span
                  key={index}
                  id="badge-dismiss-default"
                  className="inline-flex items-center m-1 px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-sm dark:bg-blue-900 dark:text-blue-300"
                >
                  {area}
                  <button
                    onClick={() => {
                      handleRemoveArea(index);
                    }}
                    type="button"
                    className="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-xs hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                    data-dismiss-target="#badge-dismiss-default"
                    aria-label="Remove"
                  >
                    <svg
                      className="w-2 h-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Remove badge</span>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="m-1" >
            <TextField
              fullWidth
              label="Phone Number"
              id="phone"
              placeholder="Enter agency phone number"
              value={agencyFormData.phone}
              onChange={(event) =>
                handleOnChangeInputFormData("phone", event.target.value)
              }
              required
            />
          </div>

          <div className="m-1">
            <TextField
              fullWidth
              label="City"
              id="agencyName"
              placeholder="Enter city name"
              value={agencyFormData.city}
              onChange={(event) =>
                handleOnChangeInputFormData("city", event.target.value)
              }
              required
            />
          </div>

          <div className="m-1" >
            <TextField
              fullWidth
              label="District"
              id="agencyName"
              placeholder="Enter district name"
              value={agencyFormData.district}
              onChange={(event) =>
                handleOnChangeInputFormData("district", event.target.value)
              }
              required
            />
          </div>

          <div className="m-1" >
            <TextField
              fullWidth
              label="Address"
              id="agencyName"
              placeholder="Ex:flat.No,:-10/42 Landmark"
              value={agencyFormData.address}
              onChange={(event) =>
                handleOnChangeInputFormData("address", event.target.value)
              }
              required
            />
          </div>

          <div className="m-1" >
            <TextField
              fullWidth
              label="State"
              id="agencyName"
              placeholder="Enter state name"
              value={agencyFormData.state}
              onChange={(event) =>
                handleOnChangeInputFormData("state", event.target.value)
              }
              required
            />
          </div>

          <div className="m-1">
            <TextField
              fullWidth
              label="Pincode"
              id="agencyName"
              placeholder="Enter pincode "
              value={agencyFormData.pincode}
              onChange={(event) =>
                handleOnChangeInputFormData("pincode", event.target.value)
              }
              required
            />
          </div>

          <div className="mt-4">
            <div className="flex justify-end gap-2 ">
              <button
                className="px-4 py-2 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200 "
                onClick={onCancelForm}
              >
                cancel
              </button>
              <button
                className="px-4 py-2 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200"
                onClick={() => {
                  console.log(agencyFormData);
                  handleSubmit();
                }}
              >
                submit
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default page;
