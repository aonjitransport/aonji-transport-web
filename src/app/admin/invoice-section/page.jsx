"use client";

import React, { useState,useRef,useEffect, use } from "react";
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import  Button from '@mui/material/Button';  
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';


  

import Lottie from "lottie-react";
import { MdDelete,MdAddBox } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Box from '@mui/material/Box';
import { FaCircleXmark } from "react-icons/fa6";
import {successTick} from "../../../../public/assets/animations/success_tick.json"
import {succesTickLottie} from "../../../../public/assets/animations/success_tick_lottie.json"
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./animations.css"; 
import { AlertComponent } from "../../../components/Alert";
import { useAgencyStore } from "../../../store/agencyStore";
import useBillsStore from "../../../store/billsStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import BillPdfDocument from "./components/BillPdfDocument"
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@nextui-org/table";
import { PDFViewer } from "@react-pdf/renderer";





const InvoicePage = () => {

  const Admin = useAuthStore((state)=>state.user?.name||"Admininistrator")

  const {createBill,loadingToCreateBill,billCreateStatus,billResponse}= useBillsStore()
  const currentPrintBill = useBillsStore((state) => state.billResponse);

  const [createBillResponse, setCreateBillResponse] = useState(null);
 
  const [billCreated, setBillCreated] = useState(false);

  const refs = useRef([]);
  const fetchAgencies = useAgencyStore((state)=>state.fetchAgencies)
  const agencies = useAgencyStore((state)=>state.agencies)
  
  
  

  

  const [perticularConsigneeDetails, setPerticularConsigneeDetails] = useState([
    {  numOfParcels: "", type: "", name: "",address:"",phone:"",amount:"" },
  ]);

  const [consignerDetails,setConsignerDetails]= useState({
    name:"",phone:"",address:""
  })

  const [agency,setAgency]=useState({
    name:"",phone:"",address:"",_id:""
  })
  
  const [agenciesOfSelectedArea, setAgenciesOfSelectedArea] = useState([]);

  const date = new Date
 
  const [alertFlag,setAlertFlag] = useState(false)
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);


  const handleAddField = () => {
    setPerticularConsigneeDetails([
      ...perticularConsigneeDetails,
      { numOfParcels: "", type: "", name: "",address:"",phone:"",amount:""  },
    ]);
  };

  const handleRemoveField = (index) => {
    const updatedDetails = perticularConsigneeDetails.filter((_, i) => i !== index);
    setPerticularConsigneeDetails(updatedDetails);
  };

  const handlePerticularConsigneeDetailsInputChange = (index, name, value) => {
    const updatedDetails = [...perticularConsigneeDetails];
    updatedDetails[index][name] = value;
    setPerticularConsigneeDetails(updatedDetails);
  };

  

  const [bill,setBill] = useState({
    
    date:date.toLocaleDateString("hi-IN"),
    from:"proddatur",
    to:"",
    
    consigner:consignerDetails,
    totalNumOfParcels:"",
    totalAmount:"",
    paymentStatus:false,
    deliveryStatus:false,
    doorDelivery:false,
    consignees:perticularConsigneeDetails,
    agency:agency,
    administrator:Admin,
    
    description:""

    
  })
  
 useEffect(()=>{
  async function fetchData() {
    const r = await fetchAgencies()
  }
  fetchData()
 },[])

  useEffect(() => {
    

    const totalAmount = bill.consignees.reduce((accumlator,item)=>accumlator+ (parseFloat(item.amount)||0)  ,0)
    const totalParcels = bill.consignees.reduce((accumlator,item)=>accumlator+ (parseFloat(item.numOfParcels)||0)  ,0)
    
    

    setBill((prevBill) => ({ ...prevBill,totalAmount:totalAmount,totalNumOfParcels:totalParcels, consignees: perticularConsigneeDetails ,consigner:consignerDetails}));
      
    
  }, [perticularConsigneeDetails,consignerDetails,bill.consignees]);



  const handleBillInputChange = (name, value) => {
    setBill((prevBill) => ({ ...prevBill, [name]: value }));
  };

  const handleConsignerDetailsInputChange = (name,value)=>{
      setConsignerDetails((prevBill)=>({...prevBill,[name]:value}))
  }



 

 ;

  const columns = [
    {
      id: "consigneeName",
      label: "Consignee",
    },
    {
      id: "parcels",
      label: "Parcels",
    },
    {
      id: "type",
      label: "Type",
    },
    {
      id: "adress",
      label: "Address",
    },
   
  ];





useEffect(() => {
  const fetchAgencies = async () => {
    const agenciesOfSelectedArea = await useAgencyStore.getState().getAgenciesByArea(bill.to);
    console.log("Agencies of selected area:", agenciesOfSelectedArea);
    setAgenciesOfSelectedArea(agenciesOfSelectedArea);
  };

  fetchAgencies();
}, [bill.to]);


const handleSubmit = async () => {
  // post new bill
  
  

  const res = await createBill(bill);

  setCreateBillResponse(res);

    if(res) setOpenSuccessDialog(true);
  

    if (res) setBillCreated(true);
    else setBillCreated(false);
  console.log("bill submit",bill)
 console.log("API response:", res);
};

const printLR =  () => {
  
  console.log("Printing LR for bill:", createBillResponse);



};






const parcelTypes = ["N/A","AC","Air Cooler","Tyres","Refridgerator","Plastic bag","Medical box","Gunny bag",]
const [areas, setAreas] = useState([]);


const fetchAllAreas = () => {

  const areas = agencies.map ((agency) => agency.serviceAreas).flat();
  const uniqueAreas = [...new Set(areas)];  

  setAreas (uniqueAreas);
  console.log("Fetched areas:", uniqueAreas);
  

}

useEffect(() => {
  fetchAllAreas();  
}, [agencies]);

  const [consignorInputValue, setConsignorInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsigner, setSelectedConsigner] = useState(null);
  const [open, setOpen] = useState(false);
  const [printLrDialogOpen, setPrintLrDialogOpen] = useState(false);


  const [consigneeInputValues, setConsigneeInputValues] = useState({});
  const [consigneeOptions, setConsigneeOptions] = useState({});
  const [consigneeLoading, setConsigneeLoading] = useState({});

 

  useEffect(() => {
    if (consignorInputValue.trim() === "") {
      setOptions([]);
      return;
    }

    let active = true;
    setLoading(true);

    (async () => {
      const res = await fetch(`/api/consigners?search=${consignorInputValue}`);
      const data = await res.json();
      if (active) {
        setOptions(data);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [consignorInputValue]);

// 🔹 When selecting from dropdown OR typing manually
const handleSelectConsigner = (event, newValue) => {
  // Case 1: selected from dropdown (object)
  if (newValue && typeof newValue === "object") {
    setSelectedConsigner(newValue);

    setConsignerDetails({
      name: newValue.name || "",
      phone: newValue.phone || "",
      address: newValue.address || "",
    });
    return;
  }

  // Case 2: user typed manually (string)
  if (typeof newValue === "string") {
    setSelectedConsigner({ name: newValue });

    setConsignerDetails({
      name: newValue,
      phone: "",
      address: "",
    });
  }
};

const fetchConsigneeSuggestions = async (index, search, area) => {
  try {
    if (!search || !area) {
      setConsigneeOptions((prev) => ({
        ...prev,
        [index]: [],
      }));
      return;
    }

    const res = await fetch(
      `/api/consignees/search?search=${encodeURIComponent(search)}&area=${encodeURIComponent(area)}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch consignees");
    }

    const data = await res.json();

    setConsigneeOptions((prev) => ({
      ...prev,
      [index]: Array.isArray(data) ? data : [],
    }));
  } catch (error) {
    console.error("Error fetching consignee suggestions:", error);
    setConsigneeOptions((prev) => ({
      ...prev,
      [index]: [],
    }));
  }
};
``





const handleSelectConsignee = (index, newValue) => {
  // Selected from dropdown
  if (newValue && typeof newValue === "object") {
    handlePerticularConsigneeDetailsInputChange(index, "name", newValue.name || "");
    handlePerticularConsigneeDetailsInputChange(index, "phone", newValue.phone || "");
    handlePerticularConsigneeDetailsInputChange(index, "address", newValue.address || "");
    return;
  }

  // Typed manually
  if (typeof newValue === "string") {
    handlePerticularConsigneeDetailsInputChange(index, "name", newValue);
  }
};


  const handleSuccessDailogClose = () => {
    setOpenSuccessDialog(false);

     // 🔹 Reset all sub-states first
  setConsignerDetails({
    name: "",
    phone: "",
    address: "",
  });

  setConsignorInputValue("");
  setConsigneeInputValues({});
  

  setAgency({
    name: "",
    phone: "",
    address: "",
    _id: "",
  });

   setPerticularConsigneeDetails([
    { numOfParcels: "", type: "", name: "", address: "", phone: "", amount: "" },
  ]);


    // 🔹 Then reset the main bill state
  const date = new Date();
  setBill({
    date: date.toLocaleDateString("hi-IN"),
    from: "proddatur",
    to: "",
    consigner: { name: "", phone: "", address: "" },
    totalNumOfParcels: "",
    totalAmount: "",
    paymentStatus: false,
    deliveryStatus: false,
    doorDelivery: false,
    consignees: [
      { numOfParcels: "", type: "", name: "", address: "", phone: "", amount: "" },
    ],
    agency: { name: "", phone: "", address: "", _id: "" },
    administrator: Admin,
    description: "",
  });

    setBillCreated(false);
  };




  return (
    <>
      {alertFlag ? (
        <AlertComponent
          color={"warning"}
          messageHead={"Check Parcels!"}
          message={"Check Total and Perticular's parcels before submiting..."}
        />
      ) : (
        <></>
      )}

      <section className="grid gap-8 m-5 lg:grid-cols-3 md:grid-cols-3">
        {/* Invoice Form */}
        <form
          className="col-span-1 md:col-span-2 lg:col-span-2"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-6 gap-2 h-16 mb-4">
            <div className="  col-span-3 ">
              <Autocomplete
                fullWidth
                options={areas} // ✅ your area list
                value={bill.to || ""} // ✅ controlled value
                onChange={(event, newValue) =>
                  handleBillInputChange("to", newValue)
                }
                renderInput={(params) => (
                  <TextField {...params} label="TO" variant="outlined" />
                )}
                clearOnEscape
              />
            </div>

            <div className="col-span-3">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">agency</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={bill.agency.name}
                  label="agency"
                  onChange={(e) => {
                    const selectedAgency = agenciesOfSelectedArea?.find(
                      (agency) => agency.name === e.target.value
                    );
                    if (selectedAgency) {
                      setAgency({
                        name: selectedAgency.name,
                        phone: selectedAgency.phone,
                        address: selectedAgency.address,
                        _id: selectedAgency._id,
                      });
                      handleBillInputChange("agency", selectedAgency);
                    } else {
                      setAgency({ name: "", phone: "", address: "", _id: "" });
                      handleBillInputChange("agency", {});
                    }
                  }}
                >
                  {agenciesOfSelectedArea?.map((agency, index) => (
                    <MenuItem key={index} value={agency.name}>
                      {agency.name} - {agency.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="grid  grid-cols-6 gap-2 h-16 ">
            <div className="col-span-2">
            <Autocomplete
  freeSolo
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  options={options}
  getOptionLabel={(option) => option.name || ""}
  loading={loading}
  value={selectedConsigner}
  onChange={handleSelectConsigner}
  inputValue={consignorInputValue}
  onInputChange={(event, newValue) => {
    setConsignorInputValue(newValue);

    // 🔥 update state immediately while typing
    setConsignerDetails(prev => ({
      ...prev,
      name: newValue
    }));
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Consigner"
      variant="outlined"
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  )}
/>

              
            </div>

            <div className="col-span-1">
              <TextField
                fullWidth
                id="filled-basic"
                variant="filled"
                label="Phone"
                type="tel"
                maxLength={13}
                value={consignerDetails.phone}
                onChange={(e) => {
                  handleConsignerDetailsInputChange("phone", e.target.value);
                }}
              />
            </div>

            <div className="col-span-3">
              <TextField
                fullWidth
                id="filled-basic"
                variant="filled"
                label="Consigner Address"
                placeholder="Ex:10/34 street city state pincode"
                value={consignerDetails.address}
                onChange={(e) => {
                  handleConsignerDetailsInputChange("address", e.target.value);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 h-20 ">
            <div className="">
              <TextField
                fullWidth
                id="filled-basic"
                variant="filled"
                label="Total Parcels"
                type="number"
                min={0}
                value={bill.totalNumOfParcels}
                onChange={(e) => {
                  handleBillInputChange("totalNumOfParcels", e.target.value);
                }}
              />
            </div>
            <div className="">
              <TextField
                fullWidth
                label="Total Amount"
                id="filled-start-adornment"
                variant="filled"
                type="number"
                inputProps={{ min: 0 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {" "}
                        &#8377;{" "}
                      </InputAdornment>
                    ),
                  },
                }}
                value={bill.totalAmount}
                onChange={(e) => {
                  handleBillInputChange("totalAmount", e.target.value);
                }}
              />
            </div>

            <div className="  col-span-2   ">

              <FormGroup  row >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bill.paymentStatus}
                      onChange={() =>
                        handleBillInputChange(
                          "paymentStatus",
                          !bill.paymentStatus
                        )
                      }
                      color="success"
                    />
                  }
                  label="Payment"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bill.doorDelivery}
                      onChange={() =>
                        handleBillInputChange(
                          "doorDelivery",
                          !bill.doorDelivery
                        )
                      }
                      color="primary"
                    />
                  }
                  label="Door Delivery"
                />
              </FormGroup>
            </div>
          </div>

          {/* Particular Details */}
          <TransitionGroup className="space-y-4 bg-slate-200 p-2 h-80 overflow-y-auto rounded-md">
            {perticularConsigneeDetails.map((detail, index) => {
              const nodeRef = refs.current[index] || React.createRef();
              refs.current[index] = nodeRef;

              return (
                <CSSTransition
                  key={index}
                  timeout={300}
                  classNames="fade"
                  nodeRef={nodeRef}
                >
                  <div ref={nodeRef} className="grid grid-cols-12 gap-1">
                    {/* Details Fields */}
                    {/* Add and Remove Buttons */}
                    {/* consignee */}
                    <div className="col-span-2">

                     <Autocomplete
  freeSolo
  fullWidth
  options={consigneeOptions[index] || []}

  // 🔥 Display as "Name - Phone"
  getOptionLabel={(option) =>
    typeof option === "string"
      ? option
      : `${option.name} - ${option.phone}`
  }

  // 🔥 KEY FIX: phone-based identity
  isOptionEqualToValue={(option, value) =>
    option.phone === value.phone
  }

  value={null} // important

  onChange={(event, newValue) => {
    if (newValue && typeof newValue === "object") {
      handlePerticularConsigneeDetailsInputChange(index, "name", newValue.name);
      handlePerticularConsigneeDetailsInputChange(index, "phone", newValue.phone);
      handlePerticularConsigneeDetailsInputChange(index, "address", newValue.address);
    }

    if (typeof newValue === "string") {
      handlePerticularConsigneeDetailsInputChange(index, "name", newValue);
    }
  }}

  onInputChange={(event, newInputValue) => {
    handlePerticularConsigneeDetailsInputChange(
      index,
      "name",
      newInputValue
    );

    // 🔥 pass selected TO (area)
    fetchConsigneeSuggestions(index, newInputValue, bill.to);
  }}

  renderInput={(params) => (
    <TextField
      {...params}
      variant="filled"
      label="Consignee Name"
    />
  )}
/>


                    </div>
                    {/* consignee phone */}
                    <div className="col-span-2">
                      <TextField
                        fullWidth
                        id="filled-basic"
                        variant="filled"
                        label="phone"
                        type="tel"
                        maxLength={13}
                        value={perticularConsigneeDetails[index].phone}
                        onChange={(e) => {
                          handlePerticularConsigneeDetailsInputChange(
                            index,
                            "phone",
                            e.target.value
                          );
                        }}
                      />
                    </div>
                    {/* no of parcels */}
                    <div className="col-span-1">
                      <TextField
                        fullWidth
                        id="filled-basic"
                        variant="filled"
                        label="Quantity"
                        type="number"
                        inputProps={{ min: 1 }}
                        value={perticularConsigneeDetails[index].numOfParcels}
                        onChange={(e) => {
                          handlePerticularConsigneeDetailsInputChange(
                            index,
                            "numOfParcels",
                            e.target.value
                          );
                        }}
                      />
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <Autocomplete
                fullWidth
                options={parcelTypes} // ✅ your area list
                value={ perticularConsigneeDetails[index].type || ""} // ✅ controlled value
                onChange={(event, newValue) =>
                  handlePerticularConsigneeDetailsInputChange(
                    index,
                    "type",
                    newValue
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Type" variant="outlined" />
                )}
                clearOnEscape
              />
                      
                    </div>


                    {/* amount */}
                    <div className="col-span-1">
                      <TextField
                        fullWidth
                        label="Amount"
                        id="filled-start-adornment"
                        variant="filled"
                        type="number"
                        inputProps={{ min: 0 }}
                        placeholder="&#8377;"
                        value={perticularConsigneeDetails[index].amount}
                        onChange={(e) => {
                          handlePerticularConsigneeDetailsInputChange(
                            index,
                            "amount",
                            e.target.value
                          );
                        }}
                      />
                    </div>

                    {/* address */}
                    <div className="col-span-3">
                      <TextField
                        fullWidth
                        id="filled-basic"
                        variant="filled"
                        label="Address"
                        placeholder="Ex:10/34 street city state pincode"
                        value={perticularConsigneeDetails[index].address}
                        onChange={(e) =>
                          handlePerticularConsigneeDetailsInputChange(
                            index,
                            "address",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Add & Remove Buttons */}
                    <div className="col-span-1 flex items-center mt-6 gap-1">
                      {index === perticularConsigneeDetails.length - 1 && (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={handleAddField}
                          className="h-8 w-10 flex items-center justify-center"
                        >
                          ADD
                        </Button>
                      )}
                      {perticularConsigneeDetails.length > 1 && (
                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => handleRemoveField(index)}
                          className="  lg:h-8  w-10 flex items-center justify-center"
                        >
                          DELETE
                        </Button>
                      )}
                    </div>
                  </div>
                </CSSTransition>
              );
            })}
          </TransitionGroup>

          {/* Submit Button */}
          <div className="flex justify-end gap-1 mt-4">
            <button
              onClick={handleSubmit}
              type="button"
              className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("bill data ", bill);
              }}
              className="text-white bg-gradient-to-br from-blue-800 to-blue-500 hover:bg-gradient-to-r focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-purple-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              Print
            </button>
          </div>
        </form>

        {/* Bill Preview */}
        <div className="   bg-slate-50 border border-gray-300 shadow-lg rounded-lg p-5">
          <h1 className="text-2xl font-mono mb-5">Bill Preview : </h1>

          <p className="font-mono">Date: {date.toLocaleDateString("hi-IN")} </p>
          <p className="font-mono">To: {bill.to}</p>
          <p className="font-mono">
            Consigner: <span>{bill.consigner.name} </span>{" "}
            <span> Phone: {bill.consigner.phone} </span>{" "}
          </p>
          <p className="font-mono">
            Total Amount: <span>{bill.totalAmount} Rupees </span>{" "}
            <span>
              {" "}
              {bill.paymentStatus ? (
                <span>-paid</span>
              ) : (
                <span> -To Pay </span>
              )}{" "}
            </span>
            {bill.doorDelivery ? "-Door delivery" : ""}{" "}
          </p>
          <p className="font-mono">
            Total Parcels: <span>{bill.totalNumOfParcels} </span>{" "}
          </p>

          <h1 className=" flex justify-center   text-xl font-mono font-semibold  ">
            Particulars
          </h1>

          <Table aria-label="bill-perview" className="font-mono">
            <TableHeader columns={columns}>
              <TableColumn>Consignee</TableColumn>
              <TableColumn>Parcels</TableColumn>
              <TableColumn>Type</TableColumn>
              <TableColumn>Amount</TableColumn>
            </TableHeader>

            <TableBody>
              {perticularConsigneeDetails.map((data, index) => (
                <TableRow className="border-b-2" key={index}>
                  <TableCell key={`${index}-consignee`}>{data.name}</TableCell>
                  <TableCell key={`${index}-numOfParcels`}>
                    {data.numOfParcels}
                  </TableCell>
                  <TableCell key={`${index}-type`}>{data.type}</TableCell>

                  <TableCell key={`${index}-amount`}>{data.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={openSuccessDialog} onClose={handleSuccessDailogClose}>
        <DialogTitle>
          {billCreateStatus === "loading"
            ? "Creating Bill..."
            : billCreateStatus === "success"
            ? "Bill Created Successfully!"
            : billCreateStatus === "error"
            ? "Failed to Create Bill"
            : ""}
        </DialogTitle>

        <DialogContent>
          {billCreateStatus === "loading" && (
            <>
              <DialogContentText>
                Please wait while we create your bill...
                
              </DialogContentText>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress />
              </Box>
            </>
          )}

          {billCreateStatus === "success" && (
            <>
              <DialogContentText>
                Your bill has been successfully created!
                with Bill No: {createBillResponse ? createBillResponse.lrNumber : ""}
              </DialogContentText>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Lottie
                  animationData={succesTickLottie}
                  loop={true}
                  className="flex justify-center items-center w-60 h-auto lg:w-72 lg:h-auto "
                  alt="grow"
                />
              </Box>
            </>
          )}

          {billCreateStatus === "error" && (
            <DialogContentText color="error">
              Something went wrong. Please try again later.
            </DialogContentText>
          )}
        </DialogContent>

        <DialogActions>
          {billCreateStatus === "success" && (
            <Button>
              <PDFDownloadLink
                document={<BillPdfDocument bill={currentPrintBill} />}
                fileName={`LR_${createBillResponse ? createBillResponse.lrNumber : "bill"}.pdf`}
              >
                Download LR
              </PDFDownloadLink>
              
            </Button>
          )}
          {billCreateStatus === "success" && (
            
            <Button onClick={()=>{setPrintLrDialogOpen(true),console.log("current bill",currentPrintBill)}}>Print LR</Button>
          )}
          <Button onClick={handleSuccessDailogClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={printLrDialogOpen} onClose={() => setPrintLrDialogOpen(false)} maxWidth="md" fullWidth>

        <DialogTitle>Print LR</DialogTitle>
        <DialogContent>
          {/* PDF Preview Component */}
          {printLrDialogOpen  && (
            <PDFViewer style={{ width: '100%', height: '80vh' }}>
            <BillPdfDocument bill={currentPrintBill} />
            </PDFViewer>
          )}
         
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintLrDialogOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>


    </>
  );
};

export default InvoicePage;