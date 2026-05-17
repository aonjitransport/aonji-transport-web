"use client";

import React from "react";
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
  Polyline,
} from "@react-pdf/renderer";

// ─── Types (mirroring exact model fields) ──────────────────────────────────────

interface PaymentHistory {
  amount: number;
  paidOn: string;
  note: string;
  recordedByName: string;           // stored string fallback
  recordedBy?: { name: string; email?: string }; // populated User object
}

interface AgencyCharges {
  chargeAmount: number;
  chargeRate: number;
}

interface Trip {
  tripId: string;
  driver: string;
  totalArticels: number;
  agencyCharges: AgencyCharges;
  totalAmount: number;
  totalUnpaidAmount: number;
  netPayableAmount: number;
  paymentStatus: boolean; // boolean in Trip model
  createdAt: string;
}

interface Branch {
  name: string;
  city: string;
  phone?: string;
  address?: string;
}

interface LoadStatementData {
  loadStatementId: string;
  branch: Branch;
  trips: Trip[];
  totalFreightAmount: number;
  agencyCommission: number;   // ← model field name
  netPayableToMain: number;   // ← model field name
  paidAmount: number;         // ← model field name (not totalPaidAmount)
  balanceDue: number;
  paymentStatus: "pending" | "partial" | "paid";
  paymentHistory: PaymentHistory[];
  closedAt?: string;
  month: number;
  year: number;
  createdAt: string;
}

interface Props {
  loadStatementData?: LoadStatementData;
  loading?: boolean;
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

const PhoneIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 24 24">
    <Path
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
      fill="#333"
    />
  </Svg>
);

const EmailIcon = () => (
  <Svg width={8} height={6} viewBox="0 0 20 15">
    <Rect x="0" y="0" width="20" height="15" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
    <Polyline points="0,0 10,9 20,0" stroke="#333" strokeWidth="1.5" fill="none" />
  </Svg>
);

const PinIcon = () => (
  <Svg width={8} height={10} viewBox="0 0 14 18">
    <Path d="M7 0 C3.13 0 0 3.13 0 7 C0 12.25 7 18 7 18 C7 18 14 12.25 14 7 C14 3.13 10.87 0 7 0 Z" fill="#333" />
    <Circle cx="7" cy="7" r="2.5" fill="white" />
  </Svg>
);

const GlobeIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="1.5" fill="none" />
    <Polyline points="2,12 22,12" stroke="#333" strokeWidth="1.2" />
    <Path d="M12 2 C8 6 8 18 12 22" stroke="#333" strokeWidth="1.2" fill="none" />
    <Path d="M12 2 C16 6 16 18 12 22" stroke="#333" strokeWidth="1.2" fill="none" />
  </Svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const R = ({ children, style }: any) => (
  <View style={{ flexDirection: "row", ...style }}>{children}</View>
);

const monthName = (n: number) => MONTHS[(n ?? 1) - 1] ?? "—";

const fmt = (n?: number) =>
  n === undefined || n === null ? "—" : Number(n).toFixed(2);

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

const fmtDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  );
};

// ─── Layout atoms ──────────────────────────────────────────────────────────────

const NAVY = "#1a1a2e";

const SectionTitle = ({ num, label }: { num: number; label: string }) => (
  <R style={{ backgroundColor: NAVY, alignItems: "center", paddingVertical: 6, paddingHorizontal: 10 }}>
    <View style={{ width: 18, height: 18, backgroundColor: "white", borderRadius: 3, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
      <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY }}>{num}</Text>
    </View>
    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "white", letterSpacing: 1 }}>
      {label}
    </Text>
  </R>
);

const TH = ({ children, flex }: { children: any; flex: number }) => (
  <Text style={{ flex, fontSize: 7, fontFamily: "Helvetica-Bold", color: "white", textAlign: "center", paddingVertical: 7, paddingHorizontal: 2 }}>
    {children}
  </Text>
);

const TD = ({
  children, flex, bold, color, align,
}: {
  children: any; flex: number; bold?: boolean; color?: string; align?: "left" | "center" | "right";
}) => (
  <Text style={{ flex, fontSize: 8, fontFamily: bold ? "Helvetica-Bold" : "Helvetica", color: color ?? "#111", textAlign: align ?? "center", paddingVertical: 8, paddingHorizontal: 3 }}>
    {children ?? ""}
  </Text>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const PDFBillListDocument: React.FC<Props> = ({ loadStatementData }) => {
  if (!loadStatementData) return null;

  const d = loadStatementData;
  const trips = d.trips ?? [];
  const history = d.paymentHistory ?? [];

  const mn        = monthName(d.month);
  const dueMonth  = monthName(d.month === 12 ? 1 : d.month + 1);
  const isPaid    = d.paymentStatus === "paid";
  const isPartial = d.paymentStatus === "partial";

  const statusColor = isPaid ? "#16a34a" : isPartial ? "#d97706" : "#dc2626";
  const statusLabel = isPaid ? "PAID" : isPartial ? "PARTIAL" : "PENDING";
  const stampColor  = isPaid ? "#16a34a" : "#dc2626";
  const stampLabel  = isPaid ? "CLOSED" : "PENDING";

  // Trip table totals
  const totalQty        = trips.reduce((s, t) => s + (t.totalArticels ?? 0), 0);
  const totalCollect    = trips.reduce((s, t) => s + (t.totalUnpaidAmount ?? 0), 0);

  // Compute running balance for payment history display
  let runningDue = d.netPayableToMain ?? 0;
  const historyRows = history.map((p) => {
    const due     = runningDue;
    const balance = due - (p.amount ?? 0);
    runningDue    = balance;
    return { ...p, dueAmount: due, balanceAmount: balance };
  });

  const MIN_HISTORY_ROWS = 5;
  const emptyHistoryRows = Math.max(0, MIN_HISTORY_ROWS - historyRows.length);

  // Trip COLS
  const TC = [0.4, 1.6, 0.9, 0.6, 1.1, 1.1, 1.1, 0.9];

  return (
    <Document>
      <Page size="A4" style={{ backgroundColor: "#fff", padding: 24, fontFamily: "Helvetica" }} wrap>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <R style={{ alignItems: "center", borderBottom: "1.5 solid #000", paddingBottom: 12, marginBottom: 16 }}>

          {/* Logo */}
          <Image
            src="/aonji-final-bw-logo.png"
            style={{ width: 90, height: 50, objectFit: "contain", marginRight: 14 }}
          />

          {/* Company details */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 5 }}>
              AONJI EXPRESS LOGISTICS PVT LTD
            </Text>
            {[
              { icon: <PhoneIcon />, text: "+91 98798 98988, 080-40969999" },
              { icon: <EmailIcon />, text: "aonjieexpresslogistics@gmail.com" },
              { icon: <PinIcon />,   text: "93th, 29AAFCA2230R1ZV" },
              { icon: <GlobeIcon />, text: "www.aonjiexpresslogistics.com" },
            ].map((row, i) => (
              <R key={i} style={{ alignItems: "center", marginBottom: 2 }}>
                <View style={{ marginRight: 5, marginTop: 1 }}>{row.icon}</View>
                <Text style={{ fontSize: 7.5, color: "#333" }}>{row.text}</Text>
              </R>
            ))}
          </View>

          {/* Statement meta */}
          <View style={{ width: 210 }}>
            <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 7, textAlign: "right" }}>
              LOAD STATEMENT
            </Text>
            {[
              { label: "For the month of",   value: `${mn}, ${d.year}` },
              { label: "Agent / Branch",     value: `${d.branch?.name} - ${d.branch?.city}` },
              { label: "Load Statement ID",  value: d.loadStatementId },
              { label: "Statement Date",     value: fmtDate(d.createdAt) },
            ].map((r, i) => (
              <R key={i} style={{ marginBottom: 3 }}>
                <Text style={{ fontSize: 7.5, color: "#666", width: 95 }}>{r.label}</Text>
                <Text style={{ fontSize: 7.5, color: "#666", width: 8 }}>:</Text>
                <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#111", flex: 1 }}>{r.value}</Text>
              </R>
            ))}
          </View>
        </R>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — TRIPS DETAILS
        ════════════════════════════════════════════════════════════════ */}
        <View style={{ border: "1 solid #000", marginBottom: 14 }}>
          <SectionTitle num={1} label="TRIPS DETAILS" />

          {/* Header */}
          <R style={{ backgroundColor: NAVY }}>
            <TH flex={TC[0]}>#</TH>
            <TH flex={TC[1]}>TRIP ID</TH>
            <TH flex={TC[2]}>DATE</TH>
            <TH flex={TC[3]}>QTY</TH>
            <TH flex={TC[4]}>{"FREIGHT CHARGE\n(Rs.)"}</TH>
            <TH flex={TC[5]}>{"COLLECT\n(Rs.)"}</TH>
            <TH flex={TC[6]}>{"AGENT CHARGE\n(Rs.)"}</TH>
            <TH flex={TC[7]}>{"NET PAYABLE\n(Rs.)"}</TH>
           
          </R>

          {/* Trip rows */}
          {trips.map((trip, idx) => (
            <R key={idx} style={{ borderBottom: "1 solid #e5e7eb", backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
              <TD flex={TC[0]}>{idx + 1}</TD>
              <TD flex={TC[1]}>{trip.tripId}</TD>
              <TD flex={TC[2]}>{fmtDate(trip.createdAt)}</TD>
              <TD flex={TC[3]}>{trip.totalArticels}</TD>
              <TD flex={TC[4]}>{fmt(trip.totalAmount)}</TD>
              <TD flex={TC[5]}>{fmt(trip.totalUnpaidAmount)}</TD>
              <TD flex={TC[6]}>{fmt(trip.agencyCharges?.chargeAmount)}</TD>
              <TD flex={TC[7]}>{fmt(trip.netPayableAmount)}</TD>
              
            </R>
          ))}

          {/* TOTAL row — matches header: # | TRIP ID | DATE | QTY | FREIGHT | COLLECT | AGENT CHARGE | NET PAYABLE */}
          <R style={{ backgroundColor: "#f3f4f6", borderTop: "1 solid #000" }}>
            <TD flex={TC[0]} bold> </TD>
            <TD flex={TC[1]} bold align="left">TOTAL</TD>
            <TD flex={TC[2]}> </TD>
            <TD flex={TC[3]} bold>{totalQty}</TD>
            <TD flex={TC[4]} bold>{fmt(d.totalFreightAmount)}</TD>
            <TD flex={TC[5]} bold>{fmt(totalCollect)}</TD>
            <TD flex={TC[6]} bold>{fmt(d.agencyCommission)}</TD>
            <TD flex={TC[7]} bold>{fmt(d.netPayableToMain)}</TD>
          </R>
        </View>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — SUMMARY
        ════════════════════════════════════════════════════════════════ */}
        <View style={{ border: "1 solid #000", marginBottom: 14 }}>
          <SectionTitle num={2} label="SUMMARY" />

          {/* Cards row */}
          <R style={{ borderBottom: "1 solid #ddd" }}>
            {[
              { label: "TOTAL FREIGHT AMOUNT",   value: `Rs. ${fmt(d.totalFreightAmount)}` },
              { label: "TOTAL AGENT COMMISSION", value: `Rs. ${fmt(d.agencyCommission)}` },
              { label: "NET PAYABLE TO MAIN",    value: `Rs. ${fmt(d.netPayableToMain)}` },
            ].map((card, i, arr) => (
              <View key={i} style={{ flex: 1, padding: 12, borderRight: i < arr.length - 1 ? "1 solid #ddd" : 0 }}>
                <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#666", marginBottom: 5 }}>
                  {card.label}
                </Text>
                <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: "#111" }}>
                  {card.value}
                </Text>
              </View>
            ))}

            {/* Balance Due — dark card */}
            <View style={{ width: 130, backgroundColor: NAVY, padding: 12, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#aaa", marginBottom: 5 }}>
                BALANCE DUE
              </Text>
              <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: "#ef4444" }}>
                Rs. {fmt(d.balanceDue)}
              </Text>
            </View>
          </R>

          {/* Status + paid row */}
          <R style={{ paddingVertical: 8, paddingHorizontal: 12, alignItems: "center" }}>
            <R style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#555", marginRight: 6 }}>PAYMENT STATUS</Text>
              <Text style={{ fontSize: 8, marginRight: 4 }}>:</Text>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: statusColor }}>{statusLabel}</Text>
            </R>
            <R style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#555", marginRight: 6 }}>TOTAL PAID AMOUNT</Text>
              <Text style={{ fontSize: 8, marginRight: 4 }}>:</Text>
              {/* paidAmount is the field name in model */}
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#16a34a" }}>Rs. {fmt(d.paidAmount)}</Text>
            </R>
          </R>
        </View>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — PAYMENT HISTORY
        ════════════════════════════════════════════════════════════════ */}
        <View style={{ border: "1 solid #000", marginBottom: 16 }}>
          <SectionTitle num={3} label="PAYMENT HISTORY" />

          {/* Header */}
          <R style={{ backgroundColor: NAVY }}>
            <TH flex={0.4}>#</TH>
            <TH flex={1.4}>DATE</TH>
            <TH flex={1.1}>DUE AMOUNT{"\n"}(Rs.)</TH>
            <TH flex={1.1}>PAID AMOUNT{"\n"}(Rs.)</TH>
            <TH flex={1.3}>BALANCE AMOUNT{"\n"}(Rs.)</TH>
            <TH flex={1.0}>RECORDED BY</TH>
            <TH flex={0.8}>NOTES</TH>
          </R>

          {/* History rows — fields: amount, paidOn, note, recordedByName */}
          {historyRows.map((p, idx) => (
            <R key={idx} style={{ borderBottom: "1 solid #e5e7eb", backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
              <TD flex={0.4}>{idx + 1}</TD>
              <TD flex={1.4}>{fmtDateTime(p.paidOn)}</TD>
              <TD flex={1.1}>{fmt(p.dueAmount)}</TD>
              <TD flex={1.1}>{fmt(p.amount)}</TD>
              <TD flex={1.3}>{fmt(p.balanceAmount)}</TD>
              <TD flex={1.0}>{p.recordedBy?.name ?? p.recordedByName ?? "System"}</TD>
              <TD flex={0.8}>{p.note || "—"}</TD>
            </R>
          ))}

          {/* Empty padding rows */}
          {Array.from({ length: emptyHistoryRows }).map((_, i) => (
            <R key={`ep${i}`} style={{ height: 28, borderBottom: i < emptyHistoryRows - 1 ? "1 solid #e5e7eb" : 0, backgroundColor: (historyRows.length + i) % 2 === 0 ? "#fff" : "#fafafa" }}>
              {[0.4, 1.4, 1.1, 1.1, 1.3, 1.0, 0.8].map((f, j) => (
                <View key={j} style={{ flex: f }} />
              ))}
            </R>
          ))}
        </View>

        {/* ── FOOTER NOTE ──────────────────────────────────────────────── */}
        <View style={{ marginBottom: 28 }}>
          {isPaid ? (
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Oblique", color: "#555" }}>
              * Thank you for settling the statement. We appreciate your timely payment and continued partnership.
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Oblique", color: "#555" }}>
                * Please complete the statement due before the 5th of {dueMonth} {d.year}.
              </Text>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Oblique", color: "#555" }}>
                {"  "}If already paid, kindly contact the administration office.
              </Text>
            </>
          )}
        </View>

       

        {/* ── STAMP ────────────────────────────────────────────────────── */}
        <View
          style={{
            position: "absolute",
            bottom: 220,
            right: 30,
            paddingVertical: 8,
            paddingHorizontal: 18,
            border: `2.5 solid ${stampColor}`,
            borderRadius: 4,
            opacity: 0.45,
            transform: "rotate(-15deg)",
          }}
        >
          <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: stampColor, textAlign: "center" }}>
            {stampLabel}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: "Times-Roman", color: stampColor, textAlign: "center" }}>
            AONJI EXPRESS LOGISTICS
          </Text>
        </View>

      </Page>
    </Document>
  );
};

export default PDFBillListDocument;