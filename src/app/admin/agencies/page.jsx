"use client";

import { MdAddBusiness } from "react-icons/md";
import { useEffect, useState } from "react";
import useBranchStore from "../../../store/branchStore";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";

import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const page = () => {
  const fetchBranches = useBranchStore((s) => s.fetchBranches);
  const createBranch = useBranchStore((s) => s.createBranch);
  const branches = useBranchStore((s) => s.branches);

  const [openModal, setOpenModal] = useState(false);
  const [newArea, setNewArea] = useState("");

  const [branchForm, setBranchForm] = useState({
    name: "",
    phone: "",
    city: "",
    type  : "",
    code  : "",
    address: "",
    
    
    serviceAreas: [],
  });

  const router  = useRouter();



  const [agentAuth, setAgentAuth] = useState({
    loginId: "",
    password: "",
  });
  

      function onCancelForm() {
        setOpenModal(false);
        setBranchForm({
          name: "",
          phone: "",
          city: "",
          type  : "",
          code  : "",
          serviceAreas: [],
          
          address: "",
          
        });
        setAgentAuth({ loginId: "", password: "" });
        setNewArea("");
      }

  const [showPassword, setShowPassword] = useState(false);

  const handleOnChangeInputFormData = (name,value)=>{ setBranchForm((prevState)=>({...prevState,[name]:value})) }

  useEffect(() => {
    fetchBranches();
  }, []);

  const addArea = () => {
    if (newArea.trim() && !branchForm.serviceAreas.includes(newArea.trim())) {
      setBranchForm((p) => ({
        ...p,
        serviceAreas: [...p.serviceAreas, newArea.trim()],
      }));
      setNewArea("");
    }
  };

  const handleAddArea = () => {
    const trimmed = newArea.trim();
    if (trimmed && !branchForm.serviceAreas.includes(trimmed)) {
      setBranchForm((prev) => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, trimmed],
      }));
      setNewArea("");
    }
  };
  const handleRemoveArea = (indexToRemove) => {
    setBranchForm((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const submit = async () => {
    await createBranch({
      loginId: agentAuth.loginId,
      password: agentAuth.password,
      branch: branchForm,
    });
    setOpenModal(false);
    fetchBranches();
    console.log(branchForm, agentAuth);
  };

  const handleSubmit = () => {
    submit();
  }
 const togglePasswordVisibility = () => { setShowPassword((prev) => !prev); };

  return (
    <>
      <div className="flex justify-end m-4">
        <button
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded"
          onClick={() => setOpenModal(true)}
        >
          <MdAddBusiness size={22} /> Add Branch
        </button>
      </div>

      <div className="flex p-3 border m-2 rounded justify-between" >
        <b>Branch Name</b> &nbsp; &nbsp; 
        <b>City</b>
        <b>trips</b>
        <b>status</b>

      </div>

      {branches.map((b) => (
        <div onClick={() => router.push(`/admin/agencies/${b._id}`)}  key={b._id} className="p-3 border m-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between">
          <b>{b.name}</b> &nbsp; &nbsp;
          <span>{b.city}</span>
          <span>{b.trips?.length || 0} </span>
          <span>{b.isActive ? "Active" : "Inactive"}</span>
        </div>
      ))}

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Create Branch</DialogTitle>
        <DialogContent>
          <div className="m-1">
            {" "}
            <TextField
              label="Agent Login ID"
              fullWidth
              value={agentAuth?.loginId}
              onChange={(e) =>
                setAgentAuth((p) => ({ ...p, loginId: e.target.value }))
              }
              required
            />{" "}
          </div>{" "}
          <div className="m-1">
            {" "}
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
                    {" "}
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {" "}
                      {showPassword ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}{" "}
                    </IconButton>{" "}
                  </InputAdornment>
                ),
              }}
            />{" "}
          </div>{" "}
          <hr className="my-4" />{" "}
          <div className="m-1">
            {" "}
            <TextField
              label="Agency Name"
              fullWidth
              id="agencyName"
              placeholder="Enter agency name here"
              value={branchForm.name}
              onChange={(event) =>
                setBranchForm((p) => ({ ...p, name: event.target.value }))
              }
              required
            />{" "}
          </div>{" "}
          <div className=" flex m-1 gap-4 ">
            {" "}
            <div>
              {" "}
              <div className="flex items-center ">
                {" "}
                <TextField
                  fullWidth
                  id="phone"
                  label="Service Area"
                  placeholder="Enter a service area"
                  value={newArea}
                  onChange={(event) => setNewArea(event.target.value)}
                  required
                />{" "}
              </div>{" "}
              <button
                onClick={handleAddArea}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-1 "
              >
                {" "}
                Add{" "}
              </button>{" "}
            </div>{" "}
            <div className=" overflow-y-auto bg-slate-200 m-2 rounded-sm w-48 h-auto ">
              {" "}
              {/* services areas */}{" "}
              {branchForm.serviceAreas.map((area, index) => (
                <span
                  key={index}
                  id="badge-dismiss-default"
                  className="inline-flex items-center m-1 px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-sm dark:bg-blue-900 dark:text-blue-300"
                >
                  {" "}
                  {area}{" "}
                  <button
                    onClick={() => {
                      handleRemoveArea(index);
                    }}
                    type="button"
                    className="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-xs hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                    data-dismiss-target="#badge-dismiss-default"
                    aria-label="Remove"
                  >
                    {" "}
                    <svg
                      className="w-2 h-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      {" "}
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />{" "}
                    </svg>{" "}
                    <span className="sr-only">Remove badge</span>{" "}
                  </button>{" "}
                </span>
              ))}{" "}
            </div>{" "}
          </div>{" "}
          <div className="m-1"> {" "}
            <Select
              fullWidth
              value={branchForm.type || ""}  
              onChange={(event) =>
                handleOnChangeInputFormData("type", event.target.value)
              } 
              displayEmpty
            >
              <MenuItem value="" disabled> -- Select Role -- </MenuItem>
              <MenuItem value="AGENT"> AGENT (default) </MenuItem>
              <MenuItem value="OWN"> OWN </MenuItem>
              
            </Select>{" "}
          </div>
          <div>
            <TextField
              fullWidth
              label="Branch Code"
              id="code"
              placeholder="Enter branch code ex:Sri rama transports = SRT" 
              value={branchForm.code}
              onChange={(event) =>
                handleOnChangeInputFormData("code", event.target.value)
              }
              required
            />
          </div>
          <div className="m-1">
            {" "}
            <TextField
              fullWidth
              label="Phone Number"
              id="phone"
              placeholder="Enter agency phone number"
              value={branchForm.phone}
              onChange={(event) =>
                handleOnChangeInputFormData("phone", event.target.value)
              }
              required
            />{" "}
          </div>{" "}
          <div className="m-1">
            {" "}
            <TextField
              fullWidth
              label="City"
              id="agencyName"
              placeholder="Enter city name"
              value={branchForm.city}
              onChange={(event) =>
                handleOnChangeInputFormData("city", event.target.value)
              }
              required
            />{" "}
          </div>{" "}
          
           
          
          <div className="m-1">
            {" "}
            <TextField
              fullWidth
              label="Address"
              id="agencyName"
              placeholder="Ex:flat.No,:-10/42 Landmark"
              value={branchForm.address}
              onChange={(event) =>
                handleOnChangeInputFormData("address", event.target.value)
              }
              required
            />{" "}
          </div>{" "}
          
         
          <div className="mt-4">
            {" "}
            <div className="flex justify-end gap-2 ">
              {" "}
              <button
                className="px-4 py-2 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200 "
                onClick={onCancelForm}
              >
                {" "}
                cancel{" "}
              </button>{" "}
              <button
                className="px-4 py-2 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200"
                onClick={() => {
                  console.log(branchForm, agentAuth);
                  handleSubmit();
                }}
              >
                {" "}
                submit{" "}
              </button>{" "}
            </div>{" "}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default page;
