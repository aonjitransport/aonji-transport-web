"use client";

import React, { use, useEffect, useRef, useState,useMemo } from "react";
// Custom cell renderer for Delivery status
const DeliveryStatusRenderer = (props) => {
  const value = props.value;
  if (value === true) {
    return (
      <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2em' }} title="Delivered">✓</span>
    );
  } else {
    return (
      <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2em' }} title="Not Delivered">✗</span>
    );
  }
};

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "./styles/dataGridStyles.css";
import useBillsStore from "../../../store/billsStore"; // Zustand Store
import { useAgencyStore } from "../../../store/agencyStore";
import useTripsStore from "../../../store/tripsStore";
import { FaDownload } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";



import { useRouter } from "next/navigation";


import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import "./styles/animations.css"
import { G } from "@react-pdf/renderer";
import Link from "next/link";
import Lottie from "lottie-react"
import loadingAnimationData from "../../../../public/assets/animations/aonjiLoading.json"

import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';

import {useReactToPrint } from "react-to-print"
import html2canvas  from "html2canvas"
import jsPDF from 'jspdf'
import { useBreakpoint } from "./hooks/useBreakPoint";

import logo from "../../../../public/ANJITLOGOBLACK.svg"
import {succesTickLottie} from "../../../../public/assets/animations/success_tick_lottie.json"
import Image from 'next/image'

import { Dialog, DialogActions, DialogContent, DialogTitle, Select, TextField,DialogContentText } from "@mui/material";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import  { InputLabel } from "@mui/material";
import  FormControl from "@mui/material/FormControl";
import Button from  "@mui/material/Button";
import { set } from "mongoose";




ModuleRegistry.registerModules([AllCommunityModule]);

function getYearsFromYearToCurrent(startYear) {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }

  return years;
}



const DataGrid = () => {
  const router = useRouter()
  const { isMobile } = useBreakpoint();

  const pdfComonentRef = useRef(null)
 

   const handlePrintPdf = useReactToPrint({
      contentRef:pdfComonentRef, 
      documentTitle: "A4_Print_Document",
      removeAfterPrint: true, 
      pageStyle: `
         @page {
      size: A4;
      margin: 0;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
      #pdfContent {
        display: block !important;
        width: 100%;
        height: auto !important;
        overflow: hidden;
      }
    }
      `,
    });

    const handlePrintPdfHtml2Canvas = async () => {
      const element = document.getElementById("pdfContent"); // Capture this div
      if (!element) {
        console.error("No element found to print");
        return;
      }
    
      // Store original styles to revert later
      const originalWidth = element.style.width;
      const originalHeight = element.style.height;
    
      // ✅ Apply A4 size dynamically only during capture
      element.style.width = "794px";
      element.style.height = "auto"; // Allow dynamic height
    
      await new Promise((resolve) => setTimeout(resolve, 200)); // Allow DOM to update
    
      // Capture the element as an image
      const canvas = await html2canvas(element, { scale: 2 }); // High resolution
      const imgData = canvas.toDataURL("image/png");
    
      // Revert to original size
      element.style.width = originalWidth;
      element.style.height = originalHeight;
    
      // Create a new PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
    
      // Convert the captured image dimensions to mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
      let yPosition = 0; // Start position for adding images
    
      while (yPosition < imgHeight) {
        pdf.addImage(imgData, "PNG", 0, -yPosition, imgWidth, imgHeight);
        yPosition += pdfHeight; // Move to next page height
        if (yPosition < imgHeight) {
          pdf.addPage(); // Add a new page if content is still left
        }
      }
    
      pdf.save("A4_Print_Document.pdf");
    };
    
    


   
    const [filterByAreaCheckedState, setFilterByAreaCheckedState] = useState(false);
    const [openTripSuccessDialog ,setOpenTripSuccessDialog]=useState(false)
  
  // over all bills, current bills state
  const { bills, fetchBills, updateBill } = useBillsStore();
  //fileter bills by month, year, city
  const[filteredBills, setFilteredBills] = useState([])


  // bills that are about to deliver which are got from trip. uses tripIds state to set this state
  const [deliveryBillsList,setdeliveryBillsList]=useState([])
  // unpaid bills of the deliveryBillsList state. to get total amount and total charge we use.
  const [unpaidBillsList,setUnpaidBillsList]=useState([])



  const [loading, setLoading] = useState(true);

  //trip store
  const { createTrip,tripCreateStatus } = useTripsStore();
  
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [openChargeseModal, setOpenChargesModal] = useState(false);
  const [PDFBillListPageData,setPDFBillListPageData] = useState(null)
  // bills ids are selected to set the trip
  const [tripIds,setTripIds]=useState([])

  const [printBillsFlag,setPrintBillsFlag]=useState(false)

  //bills request body to get bills data from backend according to year, month, city.
  const [billsReqBody, setBillsReqBody] = useState({
    month: "",
    year: "",
    to: "",
    agencyName:"",
    agencyId:"",
    deliveryStatus: false, // null means no filter, true or false to filter accordingly
  });

  const fetchFilteredBills = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`/api/bills?${params}`);
  console .log("fetching filtered bills with params:", params);
  const data = await res.json();
  setFilteredBills(data);
  console.log("Filtered bills fetched:", data);
  
};

// Call fetchFilteredBills({ year, month, to }) when filters change
useEffect(() => {
  console.log ("Filters changed, fetching bills with:", billsReqBody);
  fetchFilteredBills({
    month: billsReqBody.month,
    year: billsReqBody.year,
    to: billsReqBody.to,
    agencyName: billsReqBody.agencyName,

    deliveryStatus: billsReqBody.deliveryStatus
  });
}, [billsReqBody.month, billsReqBody.year, billsReqBody.to,billsReqBody.agencyName,billsReqBody.deliveryStatus]);




  


  const [agencyCommissionCharges,setAgencyCommissionCharges]=useState({chargeAmount:0,chargeRate:10,addedFlag:false,})
 

 
  const [Charges,setCharges]=useState({ totalArticels:0,totalAmount:0,agencyCharges:agencyCommissionCharges,grandTotalChargeAmount:0,netPayableAmount:0,totalUnpaidAmount:0,driverName:"" })
  


  





 
  
  

  const handleOnChangeAgencyCommisionCharges = (name, value) => {
    setAgencyCommissionCharges((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleOnChangeChargesInput =(name,value)=>{
    setCharges((prevState) => ({ ...prevState, [name]: value }));
  }
 

  const months = [
    "january",
    "febrauary",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  

  const agencies = useAgencyStore((state) => state.agencies); // get agencies from store
  const fetchAgencies = useAgencyStore((state)=>state.fetchAgencies)
  const getAllAgenciesByCity = useAgencyStore((state)=>state.getAllAgenciesByCity)
  const getAgenciesByArea = useAgencyStore((state)=>state.getAgenciesByArea)
  const [years, setYears] = useState([]);
  
  
  
  const dateObj = new Date();
  
  const [areas, setAreas] = useState([]);

    const[tripData,setTripData]=useState({})

    const[createdTripId,setCreatedTripId]=useState(null)
   

  useEffect(() => {
  setTripData({
    driver: Charges.driverName,
    agencyCharges: {
      chargeAmount: Charges.agencyCharges.chargeAmount,
      chargeRate: Charges.agencyCharges.chargeRate,
    },
  
    totalAmount: Charges.totalAmount,
    totalArticels: Charges.totalArticels,
    totalUnpaidAmount: Charges.totalUnpaidAmount,
 
    bills: tripIds, // <-- will now update
    agencyName: billsReqBody.agencyName || "N/A",
    agencyId:billsReqBody.agencyId || "N/A",
    grandTotalChargeAmount: Charges.grandTotalChargeAmount,
    netPayableAmount  : Charges.netPayableAmount
  });
}, [
  Charges,
  
  tripIds,
 
]);


  useEffect(() => {
  fetchAgencies(); // just trigger fetch on mount
  }, [fetchAgencies]);


 useEffect(() => {
  if (agencies && Array.isArray(agencies)) {
    const allAreas = agencies
      ?.map(agency => agency.serviceAreas || [])
      ?.flat()
      ?.filter(Boolean)
      ?.map(area => area.toLowerCase().trim()); // normalize to lowercase & remove spaces

    const uniqueSortedCities = Array.from(new Set(allAreas)).sort();

    setAreas(uniqueSortedCities);
    console.log("Normalized, unique, sorted service areas:", uniqueSortedCities);
  }
}, [agencies]);


  const gridRef = useRef(null);

   useEffect(()=>{
    async function fetchData() {
      const r = await fetchAgencies()
    }
    fetchData()
   },[])

  useEffect(() => {
    fetchBills().then(() => setLoading(false));
  }, [fetchBills]);

 


// Utility: normalize area strings for comparisons
const normalize = (s) => (typeof s === "string" ? s.trim().toLowerCase() : "");

 
useEffect(() => {
  if (billsReqBody.agencyName) {
    // Find the selected agency in the list
    const selectedAgency = agencies.find(
      agency => agency.name === billsReqBody.agencyName
    );

    if (selectedAgency) {
      // Extract its service areas
      const agencyAreas = selectedAgency.serviceAreas || [];
      setAreas(agencyAreas);
    } else {
      setAreas([]); // Clear areas if agency not found
    }
  } else {
    if (agencies && Array.isArray(agencies)) {
    const allAreas = agencies
      ?.map(agency => agency.serviceAreas || [])
      ?.flat()
      ?.filter(Boolean)
      ?.map(area => area.toLowerCase().trim()); // normalize to lowercase & remove spaces

    const uniqueSortedCities = Array.from(new Set(allAreas)).sort();

    setAreas(uniqueSortedCities);
    console.log("Normalized, unique, sorted service areas:", uniqueSortedCities);
  }
  }
}, [billsReqBody.agencyName, agencies]);

  
  // 2) Derive filteredAgencies when area selection or agencies change
 

const filteredAgencies = useMemo(() => {
  if (!agencies || agencies.length === 0) return [];

  if (billsReqBody.to) {
    const target = normalize(billsReqBody.to);
    return agencies.filter(a =>
      (a.serviceAreas || []).some(sa => normalize(sa) === target)
    );
  }

  // no area selected -> return all agencies
  return agencies;
}, [agencies, billsReqBody.to]);

//3) If user changes area, and currently selected agency doesn't serve it -> reset agencyName
    //  (keeps consistency so two-way filter doesn't conflict)

useEffect(() => {
  if (!billsReqBody.to || !billsReqBody.agencyName) return;

  const selectedAgency = agencies.find(a => a.name === billsReqBody.agencyName);
  const target = normalize(billsReqBody.to);

  if (selectedAgency && !(selectedAgency.serviceAreas || []).some(sa => normalize(sa) === target)) {
    // selected agency does not serve this area -> clear agency selection
    setBillsReqBody(prev => ({ ...prev, agencyName: "" }));
  }
}, [billsReqBody.to, billsReqBody.agencyName, agencies]);




useEffect(() => {
  if (!deliveryBillsList) return;

  // 1️⃣ Filter unpaid bills
  const unpaidBills = deliveryBillsList.filter(bill => bill.paymentStatus === false);
  setUnpaidBillsList(unpaidBills);

  // 2️⃣ Total Articles (from all bills)
  const totalArticles = deliveryBillsList.reduce(
    (sum, bill) => sum + (bill.totalNumOfParcels || 0),
    0
  );

  // 3️⃣ Total Amount (from all bills)
  const totalAmount = deliveryBillsList.reduce(
    (sum, bill) => sum + (bill.totalAmount || 0),
    0
  );

  // 4️⃣ Total Unpaid Amount (only from unpaid bills)
  const totalUnpaidAmount = unpaidBills.reduce(
    (sum, bill) => sum + (bill.totalAmount || 0),
    0
  );

  // 5️⃣ Agency Commission (only on unpaid bills)
  const commissionChargeAmount = (totalUnpaidAmount * agencyCommissionCharges.chargeRate) / 100;

  // 6️⃣ Net Payable Amount (remaining amount agency needs to pay)
  const netPayableAmount = totalUnpaidAmount - commissionChargeAmount;

  // 7️⃣ Update both states cleanly
  setAgencyCommissionCharges(prev => ({
    ...prev,
    chargeAmount: commissionChargeAmount,
  }));

  setCharges(prev => ({
    ...prev,
    totalArticels: totalArticles,
    totalAmount,
    totalUnpaidAmount,
    netPayableAmount,
    agencyCharges: {
      ...prev.agencyCharges,
      chargeAmount: commissionChargeAmount,
    },
  }));

  console.log("✅ Total unpaid:", totalUnpaidAmount);
  console.log("✅ Commission:", commissionChargeAmount);
  console.log("✅ Net payable:", netPayableAmount);
}, [
  deliveryBillsList,
  agencyCommissionCharges.chargeRate,
]);

    



  const agencyCommissionChargesTableColumns =[
    {
      id:"totalAmount",
      label:"Total Amount"
    },
    {
      id:"chargeRate",
      label:"Charge Rate"
    },
    {
      id:"chargeAmount",
      label:"Charge Amount"
    }
  ]
  
    const DeliveryStatusRenderer = (props) => {
  const value = props.value;
  if (value === true) {
    return (
      <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2em' }} title="Delivered">✓</span>
    );
  } else {
    return (
      <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2em' }} title="Not Delivered">✗</span>
    );
  }
};

// filteredBills = bills after your filters (fetched/derived elsewhere)
const displayRows = useMemo(() => {
  const idSet = new Set(tripIds);
  return (filteredBills || []).map(bill => ({
    ...bill,
    // tick the flag if this bill's _id is in tripIds
    addedToTripFlag: idSet.has(bill._id),
  }));
}, [filteredBills, tripIds]);

useEffect(() => {
  // Guard clause
  if (!filteredBills || !deliveryBillsList) return;

  // ✅ Map only once per dependency change
  const billsWithTripFlags = filteredBills.map(bill => ({
    ...bill,
    addedToTripFlag: deliveryBillsList.some(
      deliveryBill => deliveryBill._id === bill._id
    ),
  }));

  // Only update if data actually changed
  const isSame =
    JSON.stringify(filteredBills) === JSON.stringify(billsWithTripFlags);
  if (!isSame) {
    setFilteredBills(billsWithTripFlags);
  }

  // ✅ Safe refresh (only if grid is mounted)
  if (gridRef.current?.api) {
    gridRef.current.api.refreshCells({ force: true });
  }
}, [deliveryBillsList]);

  

  const colDefs = [
    { headerName: "INV No.", field: "lrNumber", width: 120, minWidth: 120, maxWidth:120 , sortable: true, filter: true },
    { headerName: "Date", field: "date", width: 110, minWidth: 110 },
    {
      headerName: "To",
      field: "to",
      
     
      width: 150,
      minWidth: 150,
    },
    {
      headerName: "Agency Name",
      field: "agency.name",
      width: 200,
      minWidth: 200,
    },
    {
      headerName: "Consigner Name",
      field: "consigner.name",
      width: 200,
      minWidth: 200,
    },
    {
      headerName: "Consignees",
      field: "consignees",
      minWidth: 350,
      width: 350,
      cellClass: "ag-cell-wrap-text",
      cellStyle: { whiteSpace: "normal", lineHeight: "1.5" },
      autoHeight: true,
      valueGetter: (params) =>
        params.data?.consignees
          ?.map((consignees) => consignees.name)
          .join(", ") || "N/A",
    },
    {
      headerName: "Parcels",
      field: "totalNumOfParcels",
      width: 80,
      minWidth: 80,
    },

    {
      headerName: "Delivery",
      field: "deliveryStatus",
      editable: false,
      width: 90,
      cellRenderer: DeliveryStatusRenderer,
      onCellValueChanged: (params) => handleStatusChange(params, "deliveryStatus"),
    },
    {
      headerName: "Amount",
      field: "totalAmount",
      width: 140,
      minWidth: 140,
      valueFormatter: (params) => `₹${(Number(params.value) || 0).toFixed(2)}`,
      cellClassRules: {
        "footer-bold": (params) => params.node.rowPinned === "bottom",
      },
    },
    {
      headerName: "Payment",
      field: "paymentStatus",
      editable: true,
      minWidth: 90,
      width: 90,
      cellEditor: "agCheckboxCellEditor",
      cellRenderer: "agCheckboxCellRenderer",
      onCellValueChanged: (params) =>
        handleStatusChange(params, "paymentStatus"),
    },
 {
  headerName: "Add To Trip",
  field: "addedToTripFlag",
  editable: (params) => !params.data.deliveryStatus,
  minWidth: 90,
  width: 120,
  cellEditor: "agCheckboxCellEditor",
  cellRenderer: "agCheckboxCellRenderer",
  onCellValueChanged: (params) => {
    const { data } = params;
    const _id = data._id;

    if (params.newValue) {
      // add id (avoid duplicates)
      setTripIds(prevIds => prevIds.includes(_id) ? prevIds : [...prevIds, _id]);

      // add full object only if not present
      setdeliveryBillsList(prev => prev.some(b => b._id === _id) ? prev : [...prev, data]);
    } else {
      // remove id and object
      setTripIds(prev => prev.filter(id => id !== _id));
      setdeliveryBillsList(prev => prev.filter(b => b._id !== _id));
    }

    // Optional: safe refresh (only if API exists)
    if (gridRef.current?.api) {
      gridRef.current.api.refreshCells({ force: true });
    }
  },
},
{
      headerName: "View Bill",
      field: "id", // You can use the "id" field for navigation
      cellRenderer: (params) => {
        const { _id } = params.data;
        // Check if the data is available
        if (_id) {
          return (
            <Link legacyBehavior href={`/admin/bills/${_id}`}>
              <a className="text-blue-500 underline">View Bill</a>
            </Link>
          );
        }
        return null; // In case `id` is not available or params.data is undefined
      },
    },
  ];

  const CustomNoRowsOverlay = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
      <h3>No bills found</h3>
      <p>Try adjusting your filters or add a new bill.</p>
    </div>
  );
};
  

  // sends bills ids to backend(backend changes the bills deliveryStatus to true) and then refetch the current bills to render the changes.
 const handleSetTrip = async () => {
  console.log("delivery list", deliveryBillsList, "trip bills ids", tripIds, "tripData", tripData);
  setOpenChargesModal(!openChargeseModal);

  
};

  const handlePostTrip = async () => {    
    try {
    const result = await createTrip(tripData); // 👈 await here
    setCreatedTripId(result?._id || null)
      
    setOpenTripSuccessDialog(true)

    if (result) {
      // Reset trip data and UI
      setTripData({});
      setdeliveryBillsList([]);
      setOpenChargesModal(false);
      setOpenPdfModal(false);
      setPrintBillsFlag(false);

      // ✅ Wait a moment or directly refetch bills
      await fetchBills(); // make sure this also returns a Promise
      
      console.log("Bills refetched after trip creation");
    } else {
      console.error("Failed to create trip. Please try again.");
    }
  } catch (err) {
    console.error("Error creating trip:", err);
  }
  };  

  const handleSuccessDailogClose = () => {
    setOpenTripSuccessDialog(false)
  };

  const handlePrintTripSheet=()=>{
    
  }



  const handleStatusChange = async (params, field) => {
    const { data, newValue } = params;
    const id = data.id|| data._id; // Use _id if id is not available
    // Ensure boolean value is sent
  let value = newValue;
  if (field === "paymentStatus") {
    value = Boolean(newValue);
  }
  if(id){
    console.log("Updating bill with ID:", id, "Field:", field, "Value:", value);
  }
  if(!id){
    console.error("ID is not available in the data object");
    return;
  }
  await updateBill(id, { [field]: value });
};
    
  

  // Function to handle row class dynamically based on status
  const getRowClass = (params) => {
    if (params.data.paymentStatus === false) {
      return "bg-gray-200 text-black"; // gray if payment is false
    }
  };

  const handleReq = () => {
    console.log(
      "req body",
      billsReqBody,
      "years",
      years,
      "find",
      "yearlent",
      years[years.length - 1]
    );
  };

  

  const handleReqBodyInputChange = (name, value) => {
    setBillsReqBody((prevState) => ({ ...prevState, [name]: value }));
  };



  useEffect(() => {
    const newYears = getYearsFromYearToCurrent(2020);
    setYears(newYears);
    
    handleReqBodyInputChange("month",months[dateObj.getMonth()])
    handleReqBodyInputChange("year",dateObj.getFullYear())
    
  }, []);


      
      
  

  const handleSubmit =async()=>{
   
  }
  

  useEffect(()=>{
    
    

  },[])



//  loading || years.length === 0

  if (loading || years.length === 0) {
    return <div className="w-full h-[calc(100vh-62px)] gap-5 flex flex-col justify-center items-center"  >
    <div className=" flex   justify-center items-center" >
            <Lottie
            animationData={loadingAnimationData}
            loop={true}
            className="flex justify-center items-center w-64 h-auto lg:w-[484px] lg:h-auto "
            alt="loading"
            
            />
      </div>
      <div>
        Loading...
      </div>
    </div>
       // You can replace this with a spinner or fallback UI
  }

  // const downloadPdf = async () => {
  //   const fileName = 'test.pdf';
  //   const blob = await pdf(<PDFBillListDocument />).toBlob();
  //   saveAs(blob, fileName);
  // };


   

  

  return (
    <>
      <div className="  flex justify-start md:px-2 mt-1  ">
        <form className="flex gap-1  ">
          <div className="  flex-grow gap-1 flex scale-75 md:scale-100  ">
            <div>
              <FormControl>
              <InputLabel id="demo-simple-select-label">Month</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select" 
                defaultValue={months[dateObj.getMonth()]}
                label="Month"  
                onChange={(e) => {
                  handleReqBodyInputChange("month", e.target.value);  
                }}
              >
                {months.map((value, index) => (   
                  <MenuItem key={index} value={value}>
                    {value}{" "}
                  </MenuItem>
                )) 
              }
              </Select>
             </FormControl>
            </div>  

            

            <div>
             <FormControl>
              <InputLabel id="demo-simple-select-label">agency</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select" 

                defaultValue={years.find( 
                  (year) => year === dateObj.getFullYear()
                )}
                label="Year"  
                onChange={(e) => {
                  handleReqBodyInputChange("year", e.target.value);
                }}
              >
                {years.map((value, index) => (  
                  <MenuItem key={index} value={value}>
                    {value}{" "}
                  </MenuItem>
                ))  
              
                 }
              </Select>
             </FormControl>

             
            </div>

          

            <div  >

              <FormControl>
              <InputLabel id="demo-simple-select-label">Agency</InputLabel> 
              <Select 
                fullWidth
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={ billsReqBody.agencyName  }
                
                label="Agency"
                onChange={(e) => {
                  const selected = filteredAgencies.find(agency => agency.name === e.target.value); 
                  console.log("selected agent", selected)
                  setBillsReqBody(prevState => ({
                    ...prevState,
                    agencyId : selected ? selected._id : "",
                    agencyName: selected  ? selected.name : ""
                  })); 
                    setTripData(prevState => ({
                    ...prevState,
                    agencyId : selected ? selected._id : "",
                    agencyName: selected  ? selected.name : ""
                  })); 
                 
                }}
              >
                <MenuItem value={""}>Select an agency</MenuItem>  
                {filteredAgencies?.map((value,index)=>(
                  <MenuItem value={value.name} key={index}  >{value.name}</MenuItem>
                ))  
                }
              </Select>
              </FormControl>   
              
            
            </div>

            {/* for optional filter have to render conditionally */}

            { filterByAreaCheckedState && (

            <div  className="flex-grow  ">
              <FormControl fullWidth>

              <InputLabel id="demo-simple-select-label">Destination Area</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select" 
                value={billsReqBody.to}
                label="Destination Area"
                onChange={(e)=>{handleReqBodyInputChange("to",e.target.value)   
                  }}  
              >
                <MenuItem value={""}>Select an area</MenuItem>  
                  {areas.map((value,index)=>( 
                    <MenuItem value={value} key={index}  >{value}</MenuItem>
                  ))} 
              </Select>

              </FormControl>

              
            </div>
            )}

                  
            <div className="flex justify-center items-end mt-3 ">
              <button
                type="button"
                onClick={()=>{handleReq,handleSubmit();console.log("charges",Charges,"dleivery bills",deliveryBillsList,"is mobile",isMobile,"req body",billsReqBody)}}
                className=" flex justify-center items-center my-1  h-10  text-white   bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5    dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <span>Get Bills</span>
              </button>
            </div>

            

       <div className="flex justify-center items-end  ">
          <div className="flex items-center mb-4 ml-2 " >
           <input id="default-checkbox" checked={!billsReqBody.deliveryStatus} onChange={()=>{handleReqBodyInputChange("deliveryStatus",!billsReqBody.deliveryStatus)}} type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
           <label  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">undelivered</label>
          </div>
           <div className="flex items-center mb-4 ml-2 " >
           <input id="default-checkbox" checked={filterByAreaCheckedState} onChange={()=>{setFilterByAreaCheckedState(!filterByAreaCheckedState)}}  type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
           <label  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">filter by destination</label>
          </div>
        </div>

          </div>
        </form>
      </div>

      <div
        className="ag-theme-alpine"
        style={{
          height: 600,
          width: "100%",
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={displayRows}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={20}
          noRowsOverlayComponent={CustomNoRowsOverlay}
          getRowClass={getRowClass}
        />
      </div>

      <hr />

      
      

      <div className=" md:flex  " >  
        
      <div className="p-4 " >
        
     
   
      </div>
      <div className="p-4" >
        <h1 className="font-mono text-center font-extrabold text-2xl" >Agency Commision Charges</h1>
      <Table  >
                        <TableHeader columns={agencyCommissionChargesTableColumns}>
                         <TableRow>
                         <TableHead>Total Amount</TableHead>
                          <TableHead>Charge Rate</TableHead>
                          <TableHead>Charged Amount</TableHead>
                          </TableRow>
                      </TableHeader>

                      <TableBody>

                      
                        <TableRow    >
                        <TableCell className="text-center"  > ₹{Charges.totalAmount}  </TableCell>
                        <TableCell className="text-center" >{agencyCommissionCharges.chargeRate}% </TableCell>
                        <TableCell className="text-center" >₹{agencyCommissionCharges.chargeAmount} </TableCell>
                        </TableRow>
                        
                     


                      </TableBody>

        </Table>
        <div className="flex justify-end p-5 font-mono font-bold " >Total:₹{agencyCommissionCharges.chargeAmount}</div>

      </div>


        <div className="flex justify-end p-5 gap-4 " >
          <div>
        <button
                type="button"
                onClick={()=>{handleReq
                  handleSetTrip()
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
              >
                <span> Set Trip</span>
              </button>
              </div>
              

                   
                 
                 
        </div>
        
         </div>

                {/*print bills list modals are here  */}
    



      <Dialog
        open={openChargeseModal}
        onClose={() => setOpenChargesModal(false)}
      >
        <DialogTitle  >Charges</DialogTitle>
        <DialogContent>
          <div>
            
         
            <h1 className="font-semibold text-xl" >Add Driver Name</h1>
            <div>
                 
                 <TextField
                   
                 
                  
                    fullWidth
                    label = "Driver's Name"
                   value={Charges.driverName}
                   onChange={(e) => handleOnChangeChargesInput("driverName",e.target.value)}
                   placeholder="Enter Driver's Name Here"
                 />
            </div>

           


               
          </div>








                  {/* agency commission */}

          <div>
            <h1 className="font-semibold text-xl py-4" >Agency Comission</h1>
            <div className="flex justify-start items-start gap-1 ">
              <div>
                
                <TextField
                 
                  type="number"
                  min={1}
                  
                  label="Total Amount"
                  value={Charges.totalAmount}
                  placeholder="Total Amount "
                  readOnly
                />
              </div>
              <div>
              
                <TextField
                  label="Charge Rate (%)"
                  
                  type="number"
                  min={1}
                  
                  placeholder="Charge percent    "
                  value={agencyCommissionCharges.chargeRate}
                  onChange={(e)=>{handleOnChangeAgencyCommisionCharges("chargeRate",e.target.value),console.log(agencyCommissionCharges);
                  }}
                />
              </div>
              <div className="flex gap-1 mt-5 " >


              <button
                  
                  className= {`bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-2 border ${agencyCommissionCharges.addedFlag?"cursor-not-allowed opacity-45":""}   rounded`}
                  size="sm"
                  onClick={()=>{  
                    const totAmount = Charges.totalAmount/100 * agencyCommissionCharges.chargeRate;
                    handleOnChangeAgencyCommisionCharges("chargeAmount",totAmount);console.log(agencyCommissionCharges,"all charge",Charges);
                    handleOnChangeAgencyCommisionCharges("addedFlag",true)
                   }}
                  
                >
                  {agencyCommissionCharges.addedFlag?"Added":"Add"}
                </button>


                <button
                  

                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 border  rounded ${!agencyCommissionCharges.addedFlag?"cursor-not-allowed opacity-45":""}  `}
                  size="sm"
                  onClick={()=>{ handleOnChangeAgencyCommisionCharges("chargeAmount",0),handleOnChangeAgencyCommisionCharges("addedFlag",false);console.log(agencyCommissionCharges)}}
                 
                >
                  Remove
                </button>
      


              </div>


            </div>
            <div className="flex gap-2 justify-start my-2 " >
                <p className="border-r-2 px-1 " >total amount : { Charges.totalAmount } </p>
                <p className="border-r-2 px-1 ">charge rate:{Charges.agencyCharges.chargeRate}% </p>
                <p className="border-r-2 px-1 " >total charge amount:{  Charges.agencyCharges.chargeAmount } </p>
              </div>
          </div>




         


        </DialogContent>
        <DialogActions>
          <Button color="blue" onClick={handlePostTrip}  >Add Trip</Button>
          <Button color="gray" onClick={() => setOpenChargesModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>




       <Dialog open={openTripSuccessDialog} onClose={handleSuccessDailogClose}>
              <DialogTitle>
                {tripCreateStatus === "loading"
                  ? "Creating Bill..."
                  : tripCreateStatus === "success"
                  ? "Bill Created Successfully!"
                  : tripCreateStatus === "error"
                  ? "Failed to Create Bill"
                  : ""}
              </DialogTitle>
      
              <DialogContent>
                {tripCreateStatus === "loading" && (
                  <>
                    <DialogContentText>
                      Please wait while we create your bill...
                    </DialogContentText>
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                      <CircularProgress />
                    </Box>
                  </>
                )}
      
                {tripCreateStatus === "success" && (
                  <>
                    <DialogContentText>
                      Your bill has been successfully created!
                      with Trip ID: {createdTripId}
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
      
                {tripCreateStatus === "error" && (
                  <DialogContentText color="error">
                    Something went wrong. Please try again later.
                  </DialogContentText>
                )}
              </DialogContent>
      
              <DialogActions>
                {tripCreateStatus === "success" && (
                  <a
                  href={`/admin/tripsheets/${createdTripId}/pdf-preview`}
                  className="bg-blue-600 text-white px-4 py-2 rounded mb-4" 
                  target="_blank"
                  rel="noopener noreferrer"
                  
                  >Print TripSheet</a>
                )}
                <Button onClick={handleSuccessDailogClose} autoFocus>
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>


     {
      true &&
      <div>
      <div className="flex justify-end mx-2  " >
        <button onClick={handlePrintPdfHtml2Canvas} className="  p-1 px-4 rounded-md text-xl   bg-gradient-to-b from-red-500 to-red-600 text-white focus:ring-2 focus:ring-red-400 hover:shadow-xl transition duration-200     " >Print</button>
      </div>
      <div id="pdfContent" ref={pdfComonentRef} className=" p-1 " >
        
      <div className=" text-black p-1 border-2 bg-slate-50 w-full  "  >
               {/* header section */}
       
               <div className=" p-2  flex justify-between  " >
       
                 <div className="text-xs font-sans font-semibold " >
                         <div  >
                            <p className="leading-none" > Contact : 9989989898 </p>
                            <p className="leading-none" > email : aonjiTransport@mail.com</p>
                         </div>
       
                 </div>
       
                 <div className=" flex flex-col items-center "  >
                     <div  >
                  <div className="  font-bebas font-bold text-5xl  tracking-[10px]  " >AONJI</div>
                 
                  <div className=' text-xs  font-sans font-bold  tracking-[6.5px] mr-[2px] mt-2  ' >TRANSPORT</div>
                  </div>
                  <div className='text-xs font-bold mt-4  ' > Beside New RTC Bustand proddatur,516360. </div>
                  <div className='' >(letter pad)</div>
       
                 </div>
       
                 <div  >
                     
                     <Image  src={logo}  alt='logo' width={120}   />
                     
       
                 </div>
     
       
               </div>
                 <div className='bg-black w-full h-[2px] ' ></div>
                 <div className='flex justify-between mb-2  ' > 
                     <div className='flex gap-2' >
                      {/* not clear about agency where.. still has some work to do  */}
                      <div>Agency:{billsReqBody.agencyName} </div>
                     <div>Driver's name:{Charges.driverName} </div>
                     </div>
                     <div>Date:{dateObj.toLocaleDateString("hi-IN")} </div>
                 </div>
       
             </div>
             {/* list table here */}
             <div className=" border-2 border-gray-200 rounded-sm m-1 p-1  " >
              <div>
                <Table>
              <TableHeader>
                    <TableRow  >
                           <TableHead  >Sl No.</TableHead>
                            <TableHead>Bill No.</TableHead>
                             <TableHead>Consigner</TableHead>
                             <TableHead>Consignees</TableHead>
                            <TableHead >Total Lot</TableHead>
                            <TableHead >Amount</TableHead>
                            <TableHead >Payment</TableHead>
                            
                       </TableRow>
                     </TableHeader>
                     <TableBody className='font-Courier_Prime' >
                      {deliveryBillsList?.map((Bill,index)=>(
                        <TableRow key={index}   style={ Bill.paymentStatus?null: { backgroundColor:"lightgray",color:"black",}} >
                          <TableCell  >{index+1}</TableCell>
                          <TableCell> {Bill.lrNumber}  </TableCell>
                          <TableCell> {Bill.consigner.name} </TableCell>
                          <TableCell >{Bill.consignees?.map((c)=>(c.name+", ")||"N/A")}  </TableCell>
                          <TableCell   >  {Bill.totalNumOfParcels}  </TableCell>
                          <TableCell> {Bill.totalAmount} </TableCell>
                          <TableCell  > {Bill.paymentStatus?"paid":"to pay"} </TableCell>

                          

                        </TableRow>
                      ))}
                      </TableBody>
                      <TableFooter className='font-Courier_Prime' >
                        <TableRow>
                          <TableCell colSpan={6} >
                            Total Amount
                          </TableCell>
                          <TableCell >₹{Charges.totalAmount} </TableCell>
                        </TableRow>
                        <TableRow>
                        <TableCell colSpan={6} >Total Unpaid Amount</TableCell>                           
                          <TableCell >₹{Charges.totalUnpaidAmount} </TableCell>                        
                        </TableRow>
                        <TableRow>
                        <TableCell colSpan={6} >Agent Commision</TableCell>                           
                          <TableCell >(-) ₹{Charges.agencyCharges.chargeAmount} </TableCell>                        
                        </TableRow>
                        
                       
                        <TableRow>
                        <TableCell colSpan={6} >Total Payable Amount</TableCell>                           
                          <TableCell >₹{Charges.netPayableAmount}/- </TableCell>                        
                        </TableRow>
                      </TableFooter>
                      </Table>
                     
              </div>
              <hr />
              <div className="flex justify-center md:justify-between gap-20 md:gap-0   mt-16 scale-50 md:scale-100  " >
              

                <div  >
                  <h1 className="text-center font-bold " >Agency Commision Charges</h1>
                <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead> Total Amount </TableHead>
                      <TableHead>Charge Rate(in %)</TableHead>
                      <TableHead>Charged Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className='font-Courier_Prime' >
                     
                        <TableRow  >
                           <TableCell>₹{Charges.totalUnpaidAmount}</TableCell>
                           <TableCell>{Charges.agencyCharges.chargeRate}% </TableCell>
                           <TableCell>₹{Charges.agencyCharges.chargeAmount} </TableCell>
                        </TableRow>
                     
                    </TableBody>
                    <TableFooter className='font-Courier_Prime' >
        <TableRow>
          <TableCell colSpan={2}>Total Charge</TableCell>
          <TableCell >₹{Charges?.agencyCharges.chargeAmount} </TableCell>
        </TableRow>
      </TableFooter>
                  </Table>

                </div>
              </div>




             </div>
             
     
     


    </div>
    </div>
     }

     


    </>
  );
};

export default DataGrid;
