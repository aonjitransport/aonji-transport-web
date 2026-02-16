import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../../../../../public/aonji-final-logo.png"
import { IoMdStar } from "react-icons/io";


interface trips{
  tripId:string;
  bills:[];
  driver:string;
  agencyCharges:{
    chargeAmount:number;
      chargeRate:number;
  };
  netPayableAmount:number;
  totalAmount:number; 
  paymentStatus:boolean;
  totalArticels:number;
  totalUnpaidAmount:number;
  createdAt:string;

  
}

interface loadStatementData{
  loadStatementId: string;
  trips: trips[];
  agency:{
    city:string;
    name:string;
    
  };
  totalFreightAmount:number;
  balanceDue:number;
  paymentStatus:boolean;
  month:number;
  year:number;

}

interface loadStatementDataProps{
  loadStatementData?:loadStatementData;    
  loading:boolean;
}

// ✅ Define styles (fixed layout, not responsive)
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent:"space-between",
    alignItems: "center",
    paddingBottom:4,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
   
  },
  logo: { width: 80, height: 40 },
  title: { fontSize: 18, fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    backgroundColor: "#eee",
    paddingVertical: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    
    paddingVertical: 1,
  },
  col1: { width: "50%",  },
  col2: { width: "15%",  },
  col3: { width: "15%",  },
  col4: { width: "20%", },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    borderTop: "1 solid #000",
    paddingTop: 6,
  },
});

const PDFBillListDocument: React.FC<loadStatementDataProps> = ({ loadStatementData }) => {
  
  console .log("Load Statement Data in PDF Component:", loadStatementData);

  const months = [
    "January",
    "February", 
    "March",
    "April",
    "May",  
    "June",
    "July",
    "August",   
    "September",
    "October",
    "November",
    "December"
  ];

  function getMonthName(monthNumber: number): string {
    return months[monthNumber - 1] || "Invalid month";
  }
  
  const monthNumber = loadStatementData?.month || 0;
  const monthName = getMonthName(monthNumber);  

  

  return (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
         
        <View style={{fontSize:6,}}  >
          <Text>
            AONJI EXPRESS LOGISTICS PVT LTD
          </Text>
          <Text>
               9897989898, 080-40969999
          </Text>
           <Text>
             gstin: 29AAECA2230R1ZV
          </Text>
          <Text>  
              aonjiexpresslogistics@gmail.com
          </Text>
          <Text>
              www.aonjiexpresslogistics.com
          </Text>
          
        </View>

         <View>
          <Text style={{fontSize:22,fontFamily:"Helvetica-Bold"}} >
            LOAD STATEMENT
          </Text>
          <Text style={{textAlign:"center",alignSelf:"center"}} >
            For the month of { monthName  } , {loadStatementData?.year} 
          </Text>
          
          <Text style={{textAlign:"center",alignSelf:"center"}} >
           Agent : {loadStatementData?.agency?.name} - {loadStatementData?.agency?.city}
          </Text>
        </View>



         <View>
          <Image src="/aonji-final-bw-logo.png" style={{ width: 100,  }} />
        </View>


        

          

          
          
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
        <Text style={[{flex:4}]}>Trip ID</Text>
        <Text style={[{flex:2}]}>Date </Text>
        <Text style={[{flex:2}]}>Qty</Text>
        <Text style={[{flex:2}]}>Freight Charge</Text> 
        <Text style={[{flex:2}]}>Balance</Text>
        <Text style={[{flex:2}]}>Payment</Text>
          

        </View>

        {/* Table Rows */}
       {loadStatementData?.trips?.map((trip, i) => (
  <View key={i} style={[styles.tableRow]} >
    <Text style={[{flex:4}]} >{trip.tripId}</Text>
    <Text style={[{flex:2}]} >{new Date(trip.createdAt).toLocaleDateString()}</Text>
    <Text style={[{flex:2}]} >{trip.totalArticels}</Text>
    <Text style={[{flex:2}]} >Rs.{trip.totalAmount}/-</Text>
    <Text style={[{flex:2}]} >Rs.{trip.totalUnpaidAmount}/-</Text>
    <Text style={[{flex:2}]} >{!trip.paymentStatus ? "prepaid":"collect"}</Text>
    
  </View>
))}

        {/* Total */}
        <View>

        <View style={styles.totalRow}>
          <Text>Total Freight Charge: Rs.{loadStatementData?.totalFreightAmount} /-</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Balance Due: Rs.{loadStatementData?.balanceDue} /-</Text>
        </View>
{loadStatementData?.paymentStatus ? (
  <View
    style={{
      position: "absolute",
      bottom: 10,
      right: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
      border: "2 solid green",
      color: "green",
      opacity: 0.5,
      transform: "rotate(-15deg)",
      borderRadius: 4,
    }}
  >
    <Text style={{ fontSize: 22, fontWeight: "bold",alignSelf:"center" }}>CLOSED</Text>
   <Text style={{fontFamily:"Times-Roman",fontSize:8,alignSelf:"center"}} >AONJI EXPRESS LOGISTICS</Text>

  </View>
) : (
  <View
    style={{
      position: "absolute",
      bottom: 10,
      right: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
      border: "2 solid red",
      color: "red",
      opacity: 0.5,
      transform: "rotate(-15deg)",
      borderRadius: 4,
    }}
  >
    <Text style={{ fontSize: 22, fontFamily:"Helvetica",textAlign:"center",alignSelf:"center" }}>PENDING</Text>
    <Text style={{fontFamily:"Times-Roman",fontSize:8,alignSelf:"center"}} >AONJI EXPRESS LOGISTICS</Text>
 
  </View>
)}
        </View>

{loadStatementData?.paymentStatus ? (
  <Text
    style={{
      marginTop: 30,
      fontSize: 10,
      textAlign: "center",
      fontFamily: "Helvetica-Oblique",
    }}
  >
    Thank you for settling the statement.  
    We appreciate your timely payment and continued partnership.  </Text>
) : (
  <Text
    style={{
      marginTop: 30,
      fontSize: 10,
      textAlign: "center",
      fontFamily: "Helvetica-Oblique",
    }}
  >
    *Please complete the statement due before the 5th of {monthName} {loadStatementData?.year}.  
    If already paid, kindly contact the administration office.*
  </Text>
)}
       

      </Page>
    </Document>
  );
}

export  default PDFBillListDocument;