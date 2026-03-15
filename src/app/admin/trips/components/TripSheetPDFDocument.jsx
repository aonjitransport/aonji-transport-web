"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ---- STYLES ----
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
  leftSection: { width: "auto" },
  middleSection: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    textAlign: "center",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  address: { fontSize: 10 },
  tableContainer: {
    marginTop: 2,
    border: "1 solid #111111",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "black",
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
  text: { fontSize: 10 },
  smallCol: { flex: 0.3 },
  lgCol: { flex: 1 },
  toPay: {
    color: "black",
    fontFamily: "Helvetica-Bold",
  },
});

// ---- DOCUMENT ----
const TripSheetPDFDocument = ({ trip }) => {
  if (!trip) return null;

  const date = new Date().toLocaleDateString("hi-IN");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.leftSection}>
            <View
              style={{
                overflow: "hidden",
                marginBottom: 4,
                backgroundColor: "black",
                borderRadius: 4,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  padding: 2,
                  fontFamily: "Helvetica-Bold",
                }}
              >
                TRIP SHEET
              </Text>
            </View>

            <Text style={styles.text}>Contact: +91 9876543210</Text>
            <Text style={styles.text}>Email: info@aonji.com</Text>
          </View>

          <View style={styles.middleSection}>
            <Text
              style={[
                styles.title,
                { fontSize: 36, bottom: 8, letterSpacing: 2 },
              ]}
            >
              AONJI
            </Text>
            <Text
              style={[
                styles.title,
                { fontSize: 10, bottom: 8, letterSpacing: 6 },
              ]}
            >
              TRANSPORT
            </Text>
            <Text style={styles.address}>
              Beside New RTC Bustand, Proddatur, 516360
            </Text>
          </View>

          <View style={styles.rightSection}>
            <Image src="/aonji-final-bw-logo.png" style={{ width: 100 }} />
          </View>
        </View>

        {/* Trip Basic Info */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Text style={styles.text}>Agency: {trip.destinationBranch?.name}</Text>
            <Text style={styles.text}>Driver: {trip.driver}</Text>
            <Text style={styles.text}>Trip ID: {trip.tripId}</Text>
          </View>

          <Text style={styles.text}>Date: {date}</Text>
        </View>

        {/* Bills Table */}
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.header]}>
            <Text style={[styles.tableCol, styles.text, styles.smallCol]}>
              Sl No.
            </Text>
            <Text style={[styles.tableCol, styles.text]}>Bill No</Text>
            <Text style={[styles.tableCol, styles.text]}>Consigner</Text>
            <Text style={[styles.tableCol, styles.text, { flex: 3 }]}>
              Consignees
            </Text>
            <Text style={[styles.tableCol, styles.text]}>Qty</Text>
            <Text style={[styles.tableCol, styles.text]}>Amount</Text>
            <Text style={[styles.tableCol, styles.text]}>Payment</Text>
          </View>

          {trip.bills?.map((bill, index) => (
            <View key={index} style={[styles.tableRow]}>
              <Text style={[styles.tableCol, styles.text, styles.smallCol]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCol, styles.text]}>
                {bill.lrNumber}
              </Text>
              <Text style={[styles.tableCol, styles.text]}>
                {bill.consigner?.name}
              </Text>
              <Text
                style={[
                  styles.tableCol,
                  styles.text,
                  { flex: 3, padding: 2 },
                ]}
              >
                {bill.consignees?.map((c) => c.name).join(", ")}
              </Text>
              <Text style={[styles.tableCol, styles.text]}>
                {bill.totalNumOfParcels}
              </Text>
              <Text style={[styles.tableCol, styles.text]}>
                Rs.{bill.totalAmount}/-
              </Text>
              <Text style={[styles.tableCol, styles.text]}>
                {bill.paymentStatus ? "Paid" : "To Pay"}
              </Text>
            </View>
          ))}

          <View
            style={{
              alignSelf: "flex-end",
              padding: 4,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Helvetica-Bold",
              }}
            >
              Total Amount: Rs.{trip.totalAmount}/-
            </Text>
          </View>
        </View>

        {/* Summary - Exactly Like Your Original */}
        <View style={{ backgroundColor: "#ddd", padding: 4 }}>
          <Text
            style={{
              textAlign: "right",
              marginRight: 15,
              fontSize: 12,
              fontFamily: "Helvetica-Bold",
            }}
          >
            Total Unpaid: Rs.{trip.totalUnpaidAmount}/-
          </Text>
          <Text
            style={{ textAlign: "right", marginRight: 15, fontSize: 12 }}
          >
            (-) Outstation Charges: Rs.{trip.totalOutstationCharges || 0}/-
          </Text>
          <Text
            style={{ textAlign: "right", marginRight: 15, fontSize: 12 }}
          >
            (-) Agent Commission: Rs.{trip.agencyCharges?.chargeAmount}/-
          </Text>

          <Text
            style={{
              textAlign: "right",
              marginRight: 15,
              fontSize: 12,
              fontFamily: "Helvetica-Bold",
            }}
          >
            Net Payable: Rs.{trip.netPayableAmount}/-
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TripSheetPDFDocument;
