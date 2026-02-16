"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";

import { LuHeartHandshake } from "react-icons/lu";



const styles = StyleSheet.create({
 
  container: {
   
    borderRadius: 6,
    padding: 1,
    marginBottom: 2,
    

  },
  page: {
    backgroundColor: "#ffffff",
    padding: 10,
    width: 595,
    height: 842, // Full A4 size to fit two half A4 bills
    
  },
  billContainer: {
    height: 400, // Half A4 size
    borderBottom: "1 solid #4c4c4c",
    border:"1 solid #ddd",
    marginVertical:5
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderBottom: "1 solid #ccc",
    paddingBottom: 3,
  },
  titleBox: {
    backgroundColor: "#1e293b",
    padding: 2,
    borderRadius: 6,
    color: "white",
    textAlign: "center",
    fontFamily:"Helvetica-Bold"
  },
  details: {
    fontSize: 10,
    color: "#333",
  },
  headerDetails: {
    fontSize: 8,
    fontFamily:"Helvetica-Bold",
    color: "#333",
  },
  section: {
    marginVertical: 3,
    padding: 5,
    border: "1 solid #ddd",
    borderRadius: 4,
  },
  dateSection:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginHorizontal:4
  },
  shippingDetailsSection:{
    
    flexDirection: "row",
    justifyContent:  "space-between",
    padding: 5,
    border: "1 solid #ddd",
    borderRadius: 4,
    fontSize:10
   
  },
  

  table: {
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
   
    justifyContent:"space-evenly"
  },
  tableCellHeader: {
    fontFamily:"Helvetica-Bold",
    fontSize: 8,
    flex: 1,
    backgroundColor:"#3f3f3f",
    color:"white",
    padding:4
  },
  tableCell: {
    fontSize: 8,
    flex: 1,
    paddingHorizontal:4,
    paddingVertical:1
  },
});

const BillPdfComponent = () => {

    const bill =  {
        "id": "1",
        "lrNumber": 1,
        "date": "12/1/2025",
        "to": "gooty",
        "agency": {
          "name": "Jayo",
          "phone": "516-685-4945",
          "address": "6 Gerald Lane"
        },
        "totalNumOfParcels": 54,
        "totalAmount": 82439,
        "paymentStatus": true,
        "deliveryStatus": false,
        "consigner": {
          "name": "Gabtune",
          "phone": "457-841-7170",
          "address": "938 Holy Cross Plaza fkej ejwfj fewoiafj "
        },
        "consignees": [
          {
            "name": "Brucie",
            "Phone": "663-991-8322",
            "numOfParcels": 6,
            "type": "plastic bag",
            "amount": 84,
            "address": "604 Pankratz Place falksdfj ejqwfjwei "
          },
          {
            "name": "Lutero",
            "Phone": "131-446-4240",
            "numOfParcels": 9,
            "type": "plastic bag",
            "amount": 69,
            "address": "2 Evergreen Junction"
          }
        ]
      }
  const date = new Date().toLocaleDateString("hi-IN");

  if (!bill) {
    return <div className="text-center text-red-500">No bill data available</div>;
  }

  const MyDocument = () => (
    <Document>

      <Page  size={"A4"} style={styles.page}>
        {[0,1].map((_,index)=>(
            <View key={index} style={styles.billContainer} >
 {/* Header Section */}
 <View style={styles.container}>
          <View style={styles.header}>
            {/* Group 1 */}
            <View style={[styles.titleBox, { padding: 10 ,paddingHorizontal:2,textAlign:"center" }]}> 
              <Text style={{ fontSize: 14, fontWeight: "bold",}}>AONJI  </Text>
              <Text style={{ fontSize: 8,  }}>TRANSPORT </Text>
            </View>
            {/* Group 2 */}
            <View  >
              <Text style={styles.headerDetails}>GST: jksdfujowieefiu</Text>
              <Text style={styles.headerDetails}>Near New RTC Bus Stand,</Text>
              <Text style={styles.headerDetails}>Proddatur, Kadapa Dist., 516360.</Text>
              <Text style={styles.headerDetails}>Phone: 9898989898</Text>
            </View>
            {/* Group 3 */}
            <View  >
              <Text style={styles.headerDetails }>Our Services In:</Text>
              <Text style={styles.headerDetails}>Anantapur</Text>
              <Text style={styles.headerDetails}>Kadapa</Text>
              <Text style={styles.headerDetails}>Kurnool</Text>
            </View>
            {/* Group 4 */}
            <View>
              <Text style={styles.headerDetails}>Thank you for choosing us!</Text>
              <LuHeartHandshake size={10} />
              <Text style={styles.headerDetails}>For safety, security, and fast delivery.</Text>
              <Text style={styles.headerDetails}>Note: Report undelivered packages within 3 months.</Text>
              <Text style={styles.headerDetails}>We are not responsible afterward.</Text>
            </View>
            {/* Group 5 */}
            
            <Image style={{width:"15%",}} src="/pdfLogo.png" />
            
          </View>
        </View>

        {/* Bill Info */}
        <View style={styles.dateSection}>
          <Text style={styles.details}>LR NO.: {bill.id}</Text>
          <Text style={styles.details}>DATE: {date}</Text>
        </View>

        {/* Shipping Details */}
        <View style={styles.shippingDetailsSection} >
        <View  >
          <Text style={styles.details}>From: Proddatur</Text>
          <Text style={styles.details}>Phone: 9898989898</Text>
          <Text style={styles.details}>Total Lot: {bill.totalNumOfParcels} </Text>

        </View>

        <View  >
          <Text style={styles.details}>To: {bill.to}</Text>
          <Text style={styles.details}>Agency: {bill.agency.name}</Text>
          <Text style={styles.details}>Address: {bill.agency.address}</Text>
          <Text style={styles.details}>Phone: {bill.agency.phone}</Text>
        </View>

        <View  >
          <Text style={styles.details}>Consigner: {bill.consigner.name}</Text>
          <Text style={styles.details}>Phone: {bill.consigner.phone}</Text>
          <Text style={styles.details}>Address: {bill.consigner.address}</Text>
          <Text style={{ fontWeight: "bold", fontSize: 12 }}>
            Total Amount: Rs. {bill.totalAmount}/- {bill.paymentStatus ? "Paid" : "To Pay"}
          </Text>
        </View>
        </View>
      
      

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>NO.</Text>
            <Text style={styles.tableCellHeader}>Consignee</Text>
            <Text style={styles.tableCellHeader}>Phone</Text>
            <Text style={styles.tableCellHeader}>Lot</Text>
            <Text style={styles.tableCellHeader}>Type</Text>
            <Text style={styles.tableCellHeader}>Amount</Text>
            <Text style={styles.tableCellHeader}>Address</Text>
          </View>

          {bill.consignees.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}</Text>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.Phone}</Text>
              <Text style={styles.tableCell}>{item.numOfParcels}</Text>
              <Text style={styles.tableCell}>{item.type}</Text>
              <Text style={styles.tableCell}>Rs. {item.amount}</Text>
              <Text style={styles.tableCell}>{item.address}</Text>
            </View>
          ))}
        </View>
            </View>
        ))}
       
      </Page>
      
    </Document>

    

  );

  return (
    <div className="w-full h-[750px] ">
        
      <PDFViewer width="100%" height="100%">
        <MyDocument />
        
       
      </PDFViewer>
    </div>
  );
};

export default BillPdfComponent;



