"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

import { Image } from "@react-pdf/renderer";

interface Branch {
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
  phone: string;
  numOfParcels: number;
  type: string;
  amount: number;
  address: string;
}

interface CreatedBy {
  name: string;
  role: string;
}

interface Bill {
  id: string;
  lrNumber: number;
  date: string;
  to: string;
  toBranch: Branch;
  fromBranch:Branch;
  totalNumOfParcels: number;
  totalAmount: number;
  paymentStatus: boolean;
  deliveryStatus: boolean;
  consigner: Consigner;
  consignees: Consignee[];
  createdBy: CreatedBy;
  doorDelivery: boolean;
}

interface PDFDocumentProps {
  bill: Bill;
}

const styles = StyleSheet.create({
  container: {
    padding: 1,
    marginBottom: 1,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 6,
    border: "1 solid #757575",
  },
  page: {
    backgroundColor: "#ffffff",
    padding: 10,
    width: 595,
    height: 842, // Full A4 size to fit two half A4 bills
  },
  billContainer: {
    height: 392, // Half A4 size
    borderBottom: "1 solid #4c4c4c",
    border: "1 solid #757575",
    marginVertical: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderBottom: "1 solid #ccc",
    paddingBottom: 2,
  },
  titleBox: {
    backgroundColor: "#1e293b",
    padding: 2,
    borderRadius: 6,
    color: "white",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  details: {
    fontSize: 10,
    color: "#333",
  },
  headerDetails: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: "#333",
  },
  section: {
    marginVertical: 2,
    padding: 4,
    border: "1 solid #ddd",
    borderRadius: 4,
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 4,
  },
  shippingDetailsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 2,
    border: "1 solid #ddd",
    borderRadius: 4,
    fontSize: 8,
  },

  table: {
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",

    justifyContent: "space-evenly",
  },
  tableCellHeader: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    flex: 1,
    backgroundColor: "#3f3f3f",
    color: "white",
    padding: 4,
  },
  tableCell: {
    fontSize: 7,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  cutLine: {
    borderBottom: "1 dashed #999",
    marginVertical: 14,
    width: "100%",
  },
});

const PDFDocument: React.FC<PDFDocumentProps> = ({ bill }) => {
  const date = new Date().toLocaleDateString("hi-IN");

  return (
    <Document>
      <Page size={"A4"} style={styles.page}>
        {[0, 1].map((_, index) => (
          <View key={index}>
            <View style={styles.billContainer}>
              {/* Header Section */}
              <View style={styles.container}>
                {/* Brand Name */}
                <View
                  style={{
                    alignItems: "center",
                    paddingVertical: 5,
                    paddingHorizontal: 4,
                    backgroundColor: "#ffffff",
                    marginBottom: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      letterSpacing: 2,
                      color: "#111",
                      textAlign: "center",
                      fontFamily: "Helvetica-Bold",
                    }}
                  >
                    AONJI EXPRESS LOGISTICS
                  </Text>
                </View>
                {/* LR subtitle bar */}
                <View
                  style={{
                    alignItems: "center",
                    padding: 3,
                    backgroundColor: "#282828",
                    marginBottom: 2,
                  }}
                >
                  <Text
                    style={
                      {
                        fontSize: 9,
                        letterSpacing: 2,
                        color: "white",
                        textAlign: "center",
                        fontFamily: "Helvetica-Bold",
                      }
                    }
                  >
                    Lorry Receipt (LR)
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 6, gap: 8 }}>

                  {/* Hanuman Logo — constrained by height only so aspect ratio is preserved */}
                  <View style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }}>
                    <Image
                      style={{ width: 40, height: 44, objectFit: "contain" }}
                      src="/hanumanlogo.png"
                    />
                  </View>

                  {/* Company Info */}
                  <View style={{ color: "#111", marginRight: 6 }}>
                    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>Aonji Express Logistics Services</Text>
                    <Text style={{ fontSize: 5.5, fontFamily: "Helvetica", marginTop: 1 }}>GSTIN:37ASAPG8594P1ZX, Reg.:12/08/2009</Text>
                    <Text style={{ fontSize: 5.5, fontFamily: "Helvetica" }}>beside new RTC Bus Stand,</Text>
                    <Text style={{ fontSize: 5.5, fontFamily: "Helvetica" }}>Proddatur, Kadapa Dist., 516360.</Text>
                    <Text style={{ fontSize: 5.5, fontFamily: "Helvetica" }}>8106226616, 6303293542.</Text>
                  </View>

                  {/* City columns — no dividers */}
                  {[
                    ["Anantapuram", "Dharmavaram", "Hindupuram", "Rayalcheruvu", "Peddavaduguru", "Kalyandurgam"],
                    ["Tadipatri", "Gooty", "Yadiki", "Kadiri", "Pamidi", "Guntakal"],
                    ["Kadapa", "Mydukuru", "Khajipet", "Chennur", "Kamalapuram", "Jammulamadugu"],
                    ["Yerraguntla", "Auku", "Adoni", "Sirivella", "Emiganore", "Kodumuru"],
                    ["Kurnool", "Nandyala", "Allagadda", "Veligodu", "Kovelkuntla", "Bhethemcherla"],
                  ].map((col, ci) => (
                    <View key={ci} style={{ flex: 1 }}>
                      {col.map((city, ri) => (
                        <Text key={ri} style={{ fontSize: 5.5, fontFamily: "Helvetica", color: "#222", lineHeight: 1.5 }}>
                          {city}
                        </Text>
                      ))}
                    </View>
                  ))}

                  {/* AONJI truck logo */}
                  <Image
                    src="/aonji-final-bw-logo.png"
                    style={{ width: 70, height: 44, objectFit: "contain" }}
                  />
                </View>
              </View>

              {/* Bill Info */}
              <View
                style={
                  
                  { ...styles.dateSection, fontFamily: "Courier-Bold", color: "#333" }
                }
              >
                <Text style={styles.details}>#{bill.lrNumber}</Text>
                <Text style={styles.details}>DATE: {date}</Text>
              </View>

              {/* Shipping Details */}
              <View
                style={{
                  flexDirection: "row",
                  border: "1 solid #ddd",
                  borderRadius: 4,
                  marginTop: 3,
                  fontSize: 8,
                }}
              >
                {/* Column 1: From */}
                <View style={{ flex: 1, padding: 6, borderRight: "1 solid #e5e7eb" }}>
                  {/* Column header */}
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#6b7280", marginBottom: 4, letterSpacing: 0.5 }}>
                    ORIGIN
                  </Text>
                  {/* Label + Value rows */}
                  <View style={{ flexDirection: "row", marginBottom: 3 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 32 }}>From</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.fromBranch.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 3 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 32 }}>Phone</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.fromBranch.phone}</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 32 }}>Lots</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.totalNumOfParcels}</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 32 }}>Issued by</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.createdBy.name}</Text>
                  </View>

                </View>

                {/* Column 2: To */}
                <View style={{ flex: 1, padding: 6, borderRight: "1 solid #e5e7eb" }}>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#6b7280", marginBottom: 4, letterSpacing: 0.5 }}>
                    DESTINATION
                  </Text>
                  <View style={{ flexDirection: "row", marginBottom: 3 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 40 }}>To</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.to}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 3 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 40 }}>Agency</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.toBranch.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 3 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 40 }}>Address</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.toBranch.address}</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 40 }}>Phone</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.toBranch.phone}</Text>
                  </View>
                </View>

                {/* Column 3: Consigner */}
                <View style={{ flex: 1, padding: 6 }}>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#6b7280", marginBottom: 4, letterSpacing: 0.5 }}>
                    CONSIGNER
                  </Text>
                  <View style={{ flexDirection: "row", marginBottom: 3 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 40 }}>Name</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.consigner.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 3 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 40 }}>Phone</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.consigner.phone}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 5 }}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", width: 40 }}>Address</Text>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica", color: "#111827", flex: 1 }}>: {bill.consigner.address}</Text>
                  </View>
                  {/* Total Amount highlight */}
                <View style={{ backgroundColor: "#1e293b", borderRadius: 3, padding: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" }}>
    Rs. {bill.totalAmount}/- {bill.paymentStatus ? "Paid" : "To Pay"}
  </Text>
  <Text style={{ fontSize: 6, fontFamily: "Helvetica", color: "#d1d5db",marginRight: 2 }}>
    {bill.doorDelivery ? "Door Delivery" : "Branch Pickup"}
  </Text>
</View>
                </View>
              </View>

              {/* Table */}
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={ { ...styles.tableCellHeader, flex: 0.2 }}>
                    NO.
                  </Text>
                  <Text style={styles.tableCellHeader}>Consignee</Text>
                  <Text style={styles.tableCellHeader}>Phone</Text>
                  <Text style={ { ...styles.tableCellHeader, flex: 0.3 }}>
                    Qty
                  </Text>
                  <Text style={styles.tableCellHeader}>Type</Text>
                  <Text style={ { ...styles.tableCellHeader, flex: 0.4 }}>
                    Amount
                  </Text>
                  <Text style={ { ...styles.tableCellHeader, flex: 1.6 }}>
                    Address
                  </Text>
                </View>

                {bill.consignees.map((item, index) => (
                  <View
                    key={index}
                    style={
                      
                      { ...styles.tableRow,
                        fontFamily: "Courier-Bold",
                        color: "black",
                        fontWeight: "bold",
                      }
                    }
                  >
                    <Text style={ { ...styles.tableCell, flex: 0.2 }}>
                      {index + 1}
                    </Text>
                    <Text style={ { ...styles.tableCell }}>
                      {item.name}
                    </Text>
                    <Text style={ { ...styles.tableCell } }>
                      {item.phone}
                    </Text>
                    <Text style={ { ...styles.tableCell, flex: 0.3 } }>
                      {item.numOfParcels}
                    </Text>
                    <Text style={styles.tableCell}>{item.type}</Text>
                    <Text style={ { ...styles.tableCell, flex: 0.4 } }>
                      Rs.{item.amount}
                    </Text>
                    <Text style={ { ...styles.tableCell, flex: 1.6 } }>
                      {item.address}
                    </Text>
                  </View>
                ))}
              </View>
              <Image
                style={{
                  width: "60%",
                  height: "auto",
                  position: "absolute",
                  right: 120,
                  top: 100,
                  zIndex: 10,
                  opacity: 0.08,
                }}
                src="/aonji-final-bw-logo.png"
              />

              {/* Receiver Signature + Terms & Conditions — pinned to bottom */}
              <View
                style={{
                  flexDirection: "row",
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  right: 4,
                  border: "1 solid #d1d5db",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {/* Left: Receiver's Signature */}
                <View
                  style={{
                    width: "38%",
                    padding: 5,
                    borderRight: "1 solid #d1d5db",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 7,
                        fontFamily: "Helvetica-Bold",
                        color: "#1f2937",
                        marginBottom: 1,
                      }}
                    >
                      Receiver's Signature
                    </Text>
                    <Text
                      style={{
                        fontSize: 5.5,
                        fontFamily: "Helvetica",
                        color: "#6b7280",
                      }}
                    >
                      Received the above goods in good condition.
                    </Text>
                  </View>

                  {/* Dotted signature line */}
                  <View
                    style={{
                      borderBottom: "1 dashed #9ca3af",
                      marginTop: 12,
                      marginBottom: 4,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 1,
                    }}
                  >
                    <Text style={{ fontSize: 5.5, fontFamily: "Helvetica", color: "#4b5563" }}>
                      Name: ___________
                    </Text>
                    <Text style={{ fontSize: 5.5, fontFamily: "Helvetica", color: "#4b5563" }}>
                      Date: ___________
                    </Text>
                  </View>
                </View>

                {/* Right: Terms & Conditions */}
                <View
                  style={{
                    width: "62%",
                    padding: 5,
                    backgroundColor: "#eff6ff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7,
                      fontFamily: "Helvetica-Bold",
                      color: "#1f2937",
                      marginBottom: 3,
                    }}
                  >
                    Terms & Conditions
                  </Text>

                  {[
                    "By signing above, the receiver acknowledges that the goods have been received in good order and condition, as per the details mentioned in this Lorry Receipt.",
                    "In case of any damage, shortage, or discrepancy, the same must be reported in writing to our office within 3 (three) months from the date of shipment.",
                    "Claims raised after the above period shall not be entertained.",
                    "Aonji Express Logistics Services shall not be held responsible for any delay, damage, shortage, or loss beyond the stipulated period.",
                  ].map((clause, i) => (
                    <View
                      key={i}
                      style={{ flexDirection: "row", marginBottom: 2, gap: 3 }}
                    >
                      <Text
                        style={{
                          fontSize: 5.5,
                          fontFamily: "Helvetica-Bold",
                          color: "#374151",
                          marginTop: 0.5,
                        }}
                      >
                        •
                      </Text>
                      <Text
                        style={{
                          fontSize: 5.5,
                          fontFamily: "Helvetica",
                          color: "#374151",
                          flex: 1,
                          lineHeight: 1.3,
                        }}
                      >
                        {clause}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            {index < 1 && <View style={styles.cutLine} />}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default PDFDocument;
