"use client";

import {
  Page,
  Text,
  View,
  Document,
  Image,
  Svg,
  Path,
  Rect,
  Circle,
  Line,
  Polyline,
} from "@react-pdf/renderer";

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

const EmailIcon = ({ size = 11, color = "#444" }) => (
  <Svg width={size} height={size * 0.75} viewBox="0 0 20 15">
    <Rect x="0" y="0" width="20" height="15" rx="2" ry="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Polyline points="0,0 10,9 20,0" stroke={color} strokeWidth="1.5" fill="none" />
  </Svg>
);

const PinIcon = ({ size = 10, color = "#444" }) => (
  <Svg width={size} height={size * 1.3} viewBox="0 0 14 18">
    <Path d="M7 0 C3.13 0 0 3.13 0 7 C0 12.25 7 18 7 18 C7 18 14 12.25 14 7 C14 3.13 10.87 0 7 0 Z" fill={color} />
    <Circle cx="7" cy="7" r="2.5" fill="white" />
  </Svg>
);

const PhoneIcon = ({ size = 9, color = "white" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
      fill={color}
    />
  </Svg>
);

const ClipboardIcon = ({ size = 13, color = "#333" }) => (
  <Svg width={size} height={size * 1.15} viewBox="0 0 20 23">
    <Rect x="2" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Rect x="7" y="0" width="6" height="5" rx="1" fill={color} />
    <Line x1="6" y1="9" x2="14" y2="9" stroke={color} strokeWidth="1.2" />
    <Line x1="6" y1="13" x2="14" y2="13" stroke={color} strokeWidth="1.2" />
    <Line x1="6" y1="17" x2="11" y2="17" stroke={color} strokeWidth="1.2" />
  </Svg>
);

// ─── Layout Helpers ────────────────────────────────────────────────────────────

const Row = ({ children, style }) => (
  <View style={{ flexDirection: "row", ...style }}>{children}</View>
);

const Cell = ({ children, flex = 1, style, header }) => (
  <Text
    style={{
      flex,
      fontSize: header ? 7 : 8,
      fontFamily: header ? "Helvetica-Bold" : "Helvetica",
      color: header ? "white" : "#111",
      textAlign: "center",
      paddingVertical: 6,
      paddingHorizontal: 3,
      ...style,
    }}
  >
    {children}
  </Text>
);

/**
 * InfoCell — one side of a full-width info row.
 * Both cells live in the SAME <Row>, so they share height automatically,
 * making the center divider and horizontal separators line up exactly.
 */
const InfoCell = ({ label, value, noBorderRight }) => (
  <View
    style={{
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 7,
      paddingHorizontal: 10,
    }}
  >
    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", width: 82 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", width: 12 }}>:</Text>
    <Text style={{ fontSize: 8, fontFamily: "Helvetica", color: "#222", flex: 1 }}>
      {value ?? "—"}
    </Text>
  </View>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const TripSheetPDFDocument = ({ trip }) => {
  if (!trip) return null;

  const date = new Date().toLocaleDateString("en-IN");
  const MIN_ROWS = 2;
  const bills = trip.bills || [];
  const emptyRows = Math.max(0, MIN_ROWS - bills.length);

  // CONSIGNEE and TYPE given more flex space for longer content
  const HEADERS  = ["SI NO.", "LR NO.", "CONSIGNER", "CONSIGNEE", "TYPE", "QTY", "AMT(Rs.)", "PAYMENT"];
  const COL_FLEX = [0.45,     0.9,      1.0,          1.5,        1.3,   0.45,  0.5,             0.6];

  return (
    <Document>
      <Page
        size="A4"
        style={{ backgroundColor: "#fff", padding: 20, fontFamily: "Helvetica" }}
        wrap
      >

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <Row style={{ alignItems: "stretch", borderBottom: "2 solid #000", marginBottom: 10 }}>

          {/* Logo + company info */}
          <Row style={{ flex: 1, alignItems: "center", paddingBottom: 10 }}>
            <Image
              src="/aonji-final-bw-logo.png"
              style={{ width: 110, height: 55, objectFit: "contain" }}
            />
            <View style={{ flex: 1, marginHorizontal: 14 }}>
              <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 1.5, marginBottom: 2 }}>
                AONJI TRANSPORT
              </Text>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Oblique", color: "#666", marginBottom: 6 }}>
                Delivering Trust, On Time, Every Time.
              </Text>
              <Row style={{ alignItems: "center", marginBottom: 4 }}>
                <View style={{ marginRight: 5, marginTop: 1 }}>
                  <EmailIcon size={11} color="#444" />
                </View>
                <Text style={{ fontSize: 8 }}>aonjitransport@gmail.com</Text>
              </Row>
              <Row style={{ alignItems: "center" }}>
                <View style={{ marginRight: 5, marginTop: 1 }}>
                  <PinIcon size={9} color="#444" />
                </View>
                <Text style={{ fontSize: 8 }}>Beside New RTC Bustand, Proddatur, 516360</Text>
              </Row>
            </View>
          </Row>

          {/* TRIP SHEET badge — fills full header height */}
          <View
            style={{
              backgroundColor: "#111",
              paddingHorizontal: 18,
              alignSelf: "stretch",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: "white", letterSpacing: 1.5 }}>
              TRIP SHEET
            </Text>
          </View>
        </Row>

        {/* ── TRIP INFO BOX ────────────────────────────────────────────── */}
        {/*
          THREE full-width rows. Each row has TWO InfoCells side-by-side.
          Since they share the same <Row> parent they're ALWAYS the same height,
          so the center vertical divider and horizontal separators align perfectly.
        */}
        <View style={{ border: "1.5 solid #aaa", borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
          <Row style={{ borderBottom: "1 solid #ccc" }}>
            <InfoCell label="AGENCY"      value={trip.destinationBranch?.name} />
            <InfoCell label="DATE"        value={date} />
          </Row>
          <Row style={{ borderBottom: "1 solid #ccc" }}>
            <InfoCell label="DRIVER NAME" value={trip.driver} />
            <InfoCell label="VEHICLE NO." value={trip.vehicleNumber} />
          </Row>
          <Row>
            <InfoCell label="TRIP ID"     value={trip.tripId} />
            <InfoCell label="CONTACT NO." value="+91 9876543210" />
          </Row>
        </View>

        {/* ── BILLS TABLE ──────────────────────────────────────────────── */}
        <View style={{ border: "1 solid #000", marginBottom: 10 }}>

          {/* Header row */}
          <Row style={{ backgroundColor: "#111", borderBottom: "1 solid #000" }}>
            <View style={{ width: 22, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}>
              <Svg width={11} height={11} viewBox="0 0 11 11">
                <Rect x="0" y="0" width="11" height="11" rx="1.5" fill="white" />
                <Polyline points="2,5.5 4.5,8 9,3" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            {HEADERS.map((label, i) => (
              <Cell key={i} flex={COL_FLEX[i]} header>
                {label}
              </Cell>
            ))}
          </Row>

          {/* Data rows */}
          {bills.map((bill, idx) => (
            <Row key={idx} style={{ borderBottom: "1 solid #ddd", minHeight: 28 }}>
              <View style={{ width: 22, alignItems: "center", justifyContent: "center" }}>
                <Svg width={10} height={10} viewBox="0 0 10 10">
                  <Rect x="0.75" y="0.75" width="8.5" height="8.5" rx="1" stroke="#888" strokeWidth="1" fill="none" />
                </Svg>
              </View>
              {[
                idx + 1,
                bill.lrNumber,
                bill.consigner?.name,
                bill.consignees?.map((c) => c.name).join(", "),
                bill.consignees?.map((c) => c.type).join(", "),
                bill.totalNumOfParcels,
                `${bill.totalAmount}/-`,
                bill.paymentStatus ? "Paid" : "Collect",
              ].map((val, i) => (
                <Cell key={i} flex={COL_FLEX[i]} style={{ color: "#111" }}>
                  {val ?? ""}
                </Cell>
              ))}
            </Row>
          ))}

          {/* Empty padding rows — horizontal lines only */}
          {Array.from({ length: emptyRows }).map((_, i) => (
            <Row key={`e${i}`} style={{ borderBottom: i < emptyRows - 1 ? "1 solid #ddd" : 0, height: 28 }}>
              <View style={{ width: 22, alignItems: "center", justifyContent: "center" }}>
                <Svg width={10} height={10} viewBox="0 0 10 10">
                  <Rect x="0.75" y="0.75" width="8.5" height="8.5" rx="1" stroke="#bbb" strokeWidth="1" fill="none" />
                </Svg>
              </View>
              {COL_FLEX.map((flex, j) => (
                <View key={j} style={{ flex }} />
              ))}
            </Row>
          ))}
        </View>

        {/* ── SUMMARY ──────────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", border: "1 solid #000", marginBottom: 10 }}>
          <View style={{ width: "34%", backgroundColor: "#2d2d2d", padding: 12, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ccc", letterSpacing: 1, marginBottom: 6 }}>
              TOTAL AMOUNT
            </Text>
            <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: "white" }}>
              Rs. {trip.totalAmount}/-
            </Text>
          </View>
          <View style={{ flex: 1, padding: 8, justifyContent: "space-between" }}>
            {[
              { label: "Collectable Amount",           val: `Rs. ${trip.totalUnpaidAmount}/-` },
              { label: "(-) OUTSTATION CHARGES", val: `Rs. ${trip.totalOutstationCharges || 0}/-` },
              { label: "(-) AGENT COMMISSION",   val: `Rs. ${trip.agencyCharges?.chargeAmount}/-` },
            ].map((row, i) => (
              <Row key={i} style={{ justifyContent: "space-between", paddingVertical: 4, borderBottom: "1 solid #e5e7eb" }}>
                <Text style={{ fontSize: 8 }}>{row.label}</Text>
                <Row>
                  <Text style={{ fontSize: 8, width: 14 }}>:</Text>
                  <Text style={{ fontSize: 8, width: 80, textAlign: "right" }}>{row.val}</Text>
                </Row>
              </Row>
            ))}
            <Row style={{ justifyContent: "space-between", backgroundColor: "#2d2d2d", padding: 5, marginTop: 4 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "white" }}>NET PAYABLE</Text>
              <Row>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "white", width: 14 }}>:</Text>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "white", width: 80, textAlign: "right" }}>
                  Rs. {trip.netPayableAmount}/-
                </Text>
              </Row>
            </Row>
          </View>
        </View>

        {/* ── NOTES / INSTRUCTIONS ─────────────────────────────────────── */}
        <View style={{ border: "1 solid #ccc", borderRadius: 4, padding: 8, marginBottom: 10 }}>
          <Row style={{ alignItems: "center", marginBottom: 5 }}>
            <View style={{ marginRight: 5 }}>
              <ClipboardIcon size={13} color="#333" />
            </View>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>NOTES / INSTRUCTIONS</Text>
          </Row>
          {[
            "Please verify all shipments before dispatch.",
            "Ensure safe delivery and collect payment as per instructions.",
            "Report any discrepancies immediately.",
          ].map((note, i) => (
            <Row key={i} style={{ marginBottom: 3 }}>
              <Text style={{ fontSize: 8, marginRight: 5, color: "#555" }}>•</Text>
              <Text style={{ fontSize: 8, color: "#333", flex: 1 }}>{note}</Text>
            </Row>
          ))}
        </View>

        {/* ── DECLARATION + AGENT SIGNATURE ────────────────────────────── */}
        <Row style={{ marginBottom: 12, gap: 16 }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Text style={{ fontSize: 8, color: "#333", lineHeight: 1.7 }}>
              I/We hereby confirm that the above shipments have been received in good condition and
              will be delivered as per the instructions provided.
            </Text>
          </View>
          <View style={{ width: 185, border: "1 solid #000" }}>
            <View style={{ backgroundColor: "#111", padding: 5 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "white", textAlign: "center" }}>
                AGENT SIGNATURE
              </Text>
            </View>
            <View style={{ padding: 10 }}>
              {["SIGNATURE", "NAME"].map((label, i) => (
                <Row key={i} style={{ alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", width: 56, color: "#333" }}>
                    {label}
                  </Text>
                  <View style={{ flex: 1, borderBottom: "1 solid #999" }} />
                </Row>
              ))}
              <Row style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", width: 56, color: "#333" }}>DATE</Text>
                <Text style={{ fontSize: 8, color: "#555" }}>_______ / _______ / _______</Text>
              </Row>
            </View>
          </View>
        </Row>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <View style={{ borderTop: "1.5 solid #000", paddingTop: 6 }}>
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 7 }}>
            Thank you for your trust in AONJI TRANSPORT.
          </Text>
          <View style={{ backgroundColor: "#111", flexDirection: "row", justifyContent: "space-around", alignItems: "center", padding: 7 }}>
            <Row style={{ alignItems: "center" }}>
              <View style={{ marginRight: 4 }}><PhoneIcon size={9} color="white" /></View>
              <Text style={{ fontSize: 7, color: "white" }}>+91 9876543210</Text>
            </Row>
            <Text style={{ fontSize: 7, color: "#555" }}>|</Text>
            <Row style={{ alignItems: "center" }}>
              <View style={{ marginRight: 4, marginTop: 1 }}><EmailIcon size={9} color="white" /></View>
              <Text style={{ fontSize: 7, color: "white" }}>aonjitransport@gmail.com</Text>
            </Row>
            <Text style={{ fontSize: 7, color: "#555" }}>|</Text>
            <Row style={{ alignItems: "center" }}>
              <View style={{ marginRight: 4, marginTop: 1 }}><PinIcon size={7} color="white" /></View>
              <Text style={{ fontSize: 7, color: "white" }}>Beside New RTC Bustand, Proddatur, 516360</Text>
            </Row>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default TripSheetPDFDocument;