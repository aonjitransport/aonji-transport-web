"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

import { LuHeartHandshake } from "react-icons/lu";

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
  totalNumOfParcels: number;
  totalAmount: number;
  paymentStatus: boolean;
  deliveryStatus: boolean;
  consigner: Consigner;
  consignees: Consignee[];
  createdBy: CreatedBy;
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
                <View
                  style={{
                    alignItems: "center",
                    padding: 4,
                    backgroundColor: "#282828",
                    marginBottom: 2,
                  }}
                >
                  <Text
                    style={[
                      {
                        fontSize: 10,
                        letterSpacing: 2,
                        color: "white",
                        textAlign: "center",
                        fontFamily: "Helvetica-Bold",
                      },
                    ]}
                  >
                    Lorry Receipt (LR)
                  </Text>
                </View>
                <View style={styles.header}>
                  {/* Group 1 */}
                  <Image
                    style={{ width: "6%", height: "auto" }}
                    src="/hanumanlogo.png"
                  />

                  {/* Group 2 */}

                  {/* Group 3 */}
                  <View
                    style={[{ fontFamily: "Helvetica-Bold", color: "#333" }]}
                  >
                    <Text style={{ fontSize: 8 }}>
                      Aonji Express Logistics Services
                    </Text>
                    <Text style={{ fontSize: 6 }}>
                      CIN: U60231AP2022PTC158408
                    </Text>
                    <Text style={{ fontSize: 6 }}>
                      beside new RTC Bus Stand,
                    </Text>
                    <Text style={{ fontSize: 6 }}>
                      Proddatur, Kadapa Dist., 516360.
                    </Text>
                    <Text style={{ fontSize: 6 }}>9898989898,84784783748.</Text>
                  </View>
                  {/* Group 4 */}
                  <View>
                    <Text
                      style={[
                        {
                          fontFamily: "Helvetica-Bold",
                          color: "#333",
                          fontSize: 8,
                        },
                      ]}
                    >
                      Our services are in:
                    </Text>
                    <Text style={styles.headerDetails}>Anantapur</Text>
                    <Text style={styles.headerDetails}>Kadapa</Text>
                    <Text style={styles.headerDetails}>Kurnool</Text>
                    <Text style={styles.headerDetails}>Kurnool</Text>
                  </View>
                  {/* Group 5 */}

                  <View>
                    <Text style={styles.headerDetails}>Tadipatri</Text>
                    <Text style={styles.headerDetails}>Dharmavaram</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                  </View>

                  <View>
                    <Text style={styles.headerDetails}>Tadipatri</Text>
                    <Text style={styles.headerDetails}>Dharmavaram</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                  </View>

                  <View>
                    <Text style={styles.headerDetails}>Tadipatri</Text>
                    <Text style={styles.headerDetails}>Dharmavaram</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                    <Text style={styles.headerDetails}>Nandyal</Text>
                  </View>

                  <View>
                    <Image
                      src="/aonji-final-bw-logo.png"
                      style={{ width: 100 }}
                    />
                  </View>
                </View>
              </View>

              {/* Bill Info */}
              <View
                style={[
                  styles.dateSection,
                  { fontFamily: "Courier-Bold", color: "#333" },
                ]}
              >
                <Text style={styles.details}>#{bill.lrNumber}</Text>
                <Text style={styles.details}>DATE: {date}</Text>
              </View>

              {/* Shipping Details */}
              <View
                style={[
                  styles.shippingDetailsSection,
                  { paddingHorizontal: 10 },
                ]}
              >
                <View style={{ fontFamily: "Helvetica-Bold", color: "#333" }}>
                  <Text style={{}}>From: Proddatur</Text>
                  <Text style={{}}>Phone: 9898989898</Text>
                  <Text style={{}}>Total Lot: {bill.totalNumOfParcels} </Text>
                </View>

                <View style={{ fontFamily: "Helvetica-Bold", color: "#333" }}>
                  <Text style={{}}>To: {bill.to}</Text>
                  <Text style={{}}>Agency: {bill.toBranch.name}</Text>
                  <Text style={{}}>Address: {bill.toBranch.address}</Text>
                  <Text style={{}}>Phone: {bill.toBranch.phone}</Text>
                </View>

                <View style={{ fontFamily: "Helvetica-Bold", color: "#333" }}>
                  <Text style={{}}>Consigner: {bill.consigner.name}</Text>
                  <Text style={{}}>Phone: {bill.consigner.phone}</Text>
                  <Text style={{}}>Address: {bill.consigner.address}</Text>
                  <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                    Total Amount: Rs. {bill.totalAmount}/-{" "}
                    {bill.paymentStatus ? "Paid" : "To Pay"}
                  </Text>
                </View>
              </View>

              {/* Table */}
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCellHeader, { flex: 0.2 }]}>
                    NO.
                  </Text>
                  <Text style={[styles.tableCellHeader]}>Consignee</Text>
                  <Text style={styles.tableCellHeader}>Phone</Text>
                  <Text style={[styles.tableCellHeader, { flex: 0.3 }]}>
                    Qty
                  </Text>
                  <Text style={styles.tableCellHeader}>Type</Text>
                  <Text style={[styles.tableCellHeader, { flex: 0.4 }]}>
                    Amount
                  </Text>
                  <Text style={[styles.tableCellHeader, { flex: 1.6 }]}>
                    Address
                  </Text>
                </View>

                {bill.consignees.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      {
                        fontFamily: "Courier-Bold",
                        color: "black",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    <Text style={[styles.tableCell, { flex: 0.2 }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.tableCell]}>{item.name}</Text>
                    <Text style={styles.tableCell}>{item.phone}</Text>
                    <Text style={[styles.tableCell, { flex: 0.3 }]}>
                      {item.numOfParcels}
                    </Text>
                    <Text style={styles.tableCell}>{item.type}</Text>
                    <Text style={[styles.tableCell, { flex: 0.4 }]}>
                      Rs.{item.amount}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.6 }]}>
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

              <View
                style={[
                  styles.details,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 2,
                    margin: 1,
                    fontFamily: "Helvetica-Bold",
                    fontSize: 8,
                    marginTop: 10,
                  },
                ]}
              >
                <View
                  style={{
                    marginLeft: 5,
                    alignItems: "center",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Text>Authorised By {bill?.createdBy?.name}</Text>
                  <Text>Aonji Express Logistics Services</Text>
                </View>

                <Text style={{ marginLeft: 5 }}>Consigner Signature</Text>
                <Text style={{ marginRight: 5 }}>Reciever Signature</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center", // 🔑 vertical alignment fix
                  justifyContent: "center",
                  marginTop: 4,
                  gap: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Helvetica-Bold",
                    color: "#333",
                  }}
                >
                  Thank you for choosing Aonji Express Logistics. We value your
                  trust and support.
                </Text>

                <Image
                  src="/handshake.png"
                  style={{
                    width: 14,
                    height: 14, // 🔑 DO NOT use height:auto
                    marginTop: -1, // 🔑 fine baseline adjustment
                  }}
                />
              </View>

              <View style={{ alignItems: "center", marginTop: 2 }}>
                <Text
                  style={{
                    fontSize: 6,
                    fontFamily: "Helvetica-Bold",
                    color: "#333",
                    textAlign: "center",
                    maxWidth: "90%",
                  }}
                >
                  Note: Claims for undelivered or missing consignments must be
                  raised within three (3) months from the booking date. No
                  liability shall be accepted thereafter.
                </Text>
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
