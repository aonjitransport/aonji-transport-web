"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";


interface agencyCharges{
  chargeAmount:number;
  chargeRate:number
}

interface outStationCharges{
  articles:number;
  charge:number;
  chargeAmount:number;

}

interface charges{
  agencyCharges:agencyCharges;
  outStationCharges:outStationCharges[];
  totalArticels:number;
  totalAmount:number;
  totalOutstationCharges:number;
  grandTotalChargeAmount:number;
  netPayableAmount:number;
  totalUnpaidAmount:number;
  driverName:string

}

interface Agency {
  name: string;
  phone: string;
  address: string;
}

interface Consigner {
  name: string;
  phone: string;
  address: string;
}

interface Consignee {
  name: string;
  Phone: string;
  numOfParcels: number;
  type: string;
  amount: number;
  address: string;
}

interface BillListData {
  id: string;
  lrNumber: number;
  date: string;
  to: string;
  agency: Agency;
  totalNumOfParcels: number;
  totalAmount: number;
  paymentStatus: boolean;
  deliveryStatus: boolean;
  consigner: Consigner;
  consignees: Consignee[];
}

interface PDFBillListDocumentProps {
  billListData?: BillListData[];
  charges?:charges
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
  },
  leftSection: {
   width:"auto"
  },
  middleSection: {
    justifyContent:"center",
    alignItems:"center",
    alignSelf:"flex-start",
    textAlign: "center",
  },
  rightSection: {
    
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  address: {
    fontSize: 10,
  },
  tableContainer: {
    marginTop: 2,
    border:"1 solid #111111"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderBottomStyle: "solid",
    paddingVertical: 4,
  },
  tableCol: {
    flex: 1,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    
  },
  header: {
    fontWeight: "bold",
    backgroundColor: "#e0e0e0",
  },
  text: {
    fontSize: 10,
  },
  smallCol: {
    flex: 0.3,
  },
  toPay:{
    color:"black",
    
    fontFamily:"Helvetica-Bold"
  },
  paid:{
   
  }
});


const PDFBillListDocument: React.FC<PDFBillListDocumentProps> = ({ billListData = [],charges, }) => {
  
    const date = new Date().toLocaleDateString("hi-IN");
    const agency = billListData[0].agency

  return (
    <Document   >
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.leftSection}>
            <Text style={styles.text}>Contact: +91 9876543210</Text>
            <Text style={styles.text}>Email: info@aonji.com</Text>
            

          </View>
          <View style={styles.middleSection}>
            <Text style={[styles.title,{fontSize:36,bottom:8,letterSpacing:2}]}>AONJI</Text>
            <Text style={[styles.title,{fontSize:10,bottom:8,letterSpacing:6}]} >TRANSPORT</Text>
            <Text style={styles.address}>Beside New RTC Bustand, Proddatur, 516360</Text>
          </View>
          <View style={styles.rightSection}>
            <Image src="/pdfLogo.png" style={{ width: 80,  }} />
          </View>
        </View>

        <View style={{flexDirection:"row",justifyContent:"space-between"}} >
        <View style={{flexDirection:"row",justifyContent:"space-between",gap:4}} >
        <Text style={styles.text}>Agency: {agency.name} </Text>
        <Text style={styles.text}>Driver Name: {charges?.driverName} </Text>
        </View>
        <Text style={styles.text}>Date:{date} </Text>

        </View>
        {/* Table Section */}
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.header]}>
            <Text style={[styles.tableCol, styles.text,styles.smallCol]}>Sl No.</Text>
            <Text style={[styles.tableCol, styles.text,styles.smallCol]}>Bill No</Text>
            <Text style={[styles.tableCol, styles.text]}>Consigner</Text>
            <Text style={[styles.tableCol, styles.text,{flex:3}]}>Consignees</Text>
            <Text style={[styles.tableCol, styles.text,{flex:.5}]}>Total Lot</Text>
            <Text style={[styles.tableCol, styles.text]}>Amount</Text>
            <Text style={[styles.tableCol, styles.text,{flex:.5}]}>Payment</Text>
          </View>
          {billListData.length > 0 ? (
            billListData.map((bill, index) => (
              <View key={bill.id} style={[styles.tableRow,bill.paymentStatus?styles.paid :styles.toPay ]} >
                <Text style={[styles.tableCol, styles.text,styles.smallCol]}>{index + 1}</Text>
                <Text style={[styles.tableCol, styles.text,styles.smallCol]}>{bill.lrNumber}</Text>
                <Text style={[styles.tableCol, styles.text]}>{bill.consigner.name}</Text>
                <Text style={[styles.tableCol, styles.text,{flex:3,padding:.5}]}>
                  {bill.consignees?.map((c) => c.name).join(", ") || "N/A"}
                </Text>
                <Text style={[styles.tableCol, styles.text,{flex:.5}]}>{bill.totalNumOfParcels}</Text>
                <Text style={[styles.tableCol, styles.text]}>Rs. {bill.totalAmount}/-</Text>
                <Text style={[styles.tableCol, styles.text,{flex:.5, }]}>
                  {bill.paymentStatus ? "Paid" : "To Pay"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.text, { textAlign: "center", marginTop: 10 }]}>No data available</Text>
          )}
          <View style={{justifyContent:"flex-end",alignSelf:"flex-end",padding:4,marginRight:10,fontSize:14,fontFamily:"Helvetica-Bold"}} ><Text>Total Amount:Rs.{charges?.totalAmount}/-</Text></View>
        </View>
        <View style={{textAlign:"left",backgroundColor:"#ddd",padding:2}} >
        <View style={{justifyContent:"flex-end",alignSelf:"flex-end",marginRight:15,fontSize:12,fontFamily:"Helvetica-Bold"}} ><Text>Total Unpaid Amount:Rs.{charges?.totalUnpaidAmount}/- </Text></View>
        <View style={{justifyContent:"flex-end",alignSelf:"flex-end",marginRight:15,fontSize:12}} ><Text>(-) Out station delivery charge:Rs.{charges?.totalOutstationCharges}/- </Text></View>
        <View style={{justifyContent:"flex-end",alignSelf:"flex-end",marginRight:15,fontSize:12}} ><Text>(-) Agent Commission:Rs.{charges?.agencyCharges.chargeAmount}/- </Text></View>
        <View style={{justifyContent:"flex-end",alignSelf:"flex-end",marginRight:15,fontSize:12,fontFamily:"Helvetica-Bold"}} ><Text>Total Payable Amount:Rs.{charges?.netPayableAmount}/-</Text></View>
        </View>
        <View style={{flexDirection:"row",justifyContent:"space-between"}} >
        <View style={[styles.tableContainer,{width:"250",marginTop:20}]}>

          <View><Text style={{fontFamily:"Helvetica-Bold",fontSize:12,backgroundColor:"gray",color:"white",padding:1}} >Out Station Delivery Charges</Text></View>

          <View style={[styles.tableRow, styles.header]}>
            <Text style={[styles.tableCol, styles.text,]}>Total Articles</Text>
            <Text style={[styles.tableCol, styles.text,]}>charge per Article (in rupees) </Text>
            <Text style={[styles.tableCol, styles.text,]}>Charge</Text>

          </View>


            
             if ({charges?.outStationCharges.length!==0}) {
               
              charges?.outStationCharges?.map((value,index)=>(
                
                <View key={index} style={[styles.tableRow]}  >
                     <Text  style={[styles.tableCol,styles.text,]} > {value.articles} </Text>
                     <Text  style={[styles.tableCol,styles.text,]} >Rs.{value.charge} </Text>
                     <Text  style={[styles.tableCol,styles.text,]} >Rs.{value.chargeAmount}/- </Text>
                     </View>

              ))}
              
              

              
              
              else {
              <View  style={[styles.tableRow]}  >
              <Text  style={[styles.tableCol,styles.text,]} > N/A </Text>
              <Text  style={[styles.tableCol,styles.text,]} >N/A </Text>
              <Text  style={[styles.tableCol,styles.text,]} >N/A </Text>
              </View>
             }
             <View style={{flexDirection:"row",fontSize:"12"}} >
                <Text  >Total Amount:</Text>
                <Text  >Rs.{charges?.totalOutstationCharges?charges.totalOutstationCharges:"N/A"} </Text>
              </View>
              

          


          </View>


          <View style={[styles.tableContainer,{width:"250",marginTop:20}]}>
          <View><Text style={{fontFamily:"Helvetica-Bold",fontSize:12,backgroundColor:"gray",color:"white",padding:1}} >Agent Commision</Text></View>
          <View style={[styles.tableRow, styles.header]}>
            <Text style={[styles.tableCol, styles.text,]}>Total Amount</Text>
            <Text style={[styles.tableCol, styles.text,]}>Commission Rate(%) </Text>
            <Text style={[styles.tableCol, styles.text,]}>Charged Amount</Text>

          </View>
          <View style={[styles.tableRow]} >
            <Text style={[styles.tableCol,styles.text,]} >Rs.{charges?.totalAmount} </Text>
            <Text style={[styles.tableCol,styles.text,]} >{charges?.agencyCharges.chargeRate}% </Text>
            <Text style={[styles.tableCol,styles.text,]} >Rs.{charges?.agencyCharges.chargeAmount} </Text>

          </View>
          <View style={{flexDirection:"row",fontSize:"12"}} >
                <Text  >Total Amount:</Text>
                <Text  >Rs.{charges?.agencyCharges.chargeAmount} </Text>
              </View>
          </View>


          </View>  
      </Page>
    </Document>
  );
};

export default PDFBillListDocument;
