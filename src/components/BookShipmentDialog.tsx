"use client";
// components/BookShipmentDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Autocomplete,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// ─── Data ────────────────────────────────────────────────────────────────────

const LOCATIONS = [
  "Ahmedabad, Gujarat",
  "Bangalore, Karnataka",
  "Bhopal, Madhya Pradesh",
  "Chennai, Tamil Nadu",
  "Coimbatore, Tamil Nadu",
  "Delhi, NCR",
  "Gurgaon, Haryana",
  "Hyderabad, Telangana",
  "Indore, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Kochi, Kerala",
  "Kolkata, West Bengal",
  "Lucknow, Uttar Pradesh",
  "Mumbai, Maharashtra",
  "Nagpur, Maharashtra",
  "Noida, Uttar Pradesh",
  "Patna, Bihar",
  "Pune, Maharashtra",
  "Surat, Gujarat",
  "Vadodara, Gujarat",
  "Visakhapatnam, Andhra Pradesh",
];

const GOODS_TYPES = [
  "Electronics",
  "Clothing & Apparel",
  "Food & Perishables",
  "Furniture",
  "Industrial Equipment",
  "Medical Supplies",
  "Automotive Parts",
  "Books & Stationery",
  "Fragile / Glassware",
  "Other",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookShipmentDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BookShipmentDialog: React.FC<BookShipmentDialogProps> = ({
  open,
  onClose,
}) => {
  const [areas, setAreas] = useState<string[]>(LOCATIONS);
  const [areasLoading, setAreasLoading] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [quantity, setQuantity] = useState("");
  const [goodsType, setGoodsType] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({
    location: false,
    name: false,
    mobile: false,
    quantity: false,
    goodsType: false,
  });

  useEffect(() => {
    if (!open) {
      setLocation(null);
      setName("");
      setMobile("");
      setQuantity("");
      setGoodsType("");
      setSubmitting(false);
      setSubmitError(null);
      setSubmitSuccess(false);
      setSubmitAttempted(false);
      setTouched({
        location: false,
        name: false,
        mobile: false,
        quantity: false,
        goodsType: false,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    const loadAreas = async () => {
      try {
        setAreasLoading(true);
        const res = await fetch("/api/branches/getallareas", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setAreas(data);
        }
      } catch (e) {
        // keep fallback LOCATIONS
      } finally {
        setAreasLoading(false);
      }
    };

    loadAreas();

    return () => controller.abort();
  }, [open]);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!location) errors.location = "Please select a location";
    if (!name.trim() || name.trim().length < 2) errors.name = "Please enter your name";
    if (!/^\d{10}$/.test(mobile)) errors.mobile = "Enter a valid 10-digit mobile number";
    const qty = Number(quantity);
    if (!quantity || !Number.isInteger(qty) || qty < 1) errors.quantity = "Enter a quantity of at least 1";
    if (!goodsType) errors.goodsType = "Please select goods type";
    return errors;
  }, [goodsType, location, mobile, name, quantity]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const shouldShowError = (key: keyof typeof touched) =>
    submitAttempted || touched[key];

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitAttempted(true);

    if (!isFormValid) {
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/public/shipment-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipToLocation: location,
          customerName: name.trim(),
          mobileNumber: mobile,
          goodsQuantity: Number(quantity),
          goodsType,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error || "Failed to submit booking. Please try again.");
        return;
      }

      setSubmitSuccess(true);
    } catch (e) {
      console.error(e);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared input sx ──────────────────────────────────────────────────────
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#fff",
      fontSize: "0.9rem",
      color: "#1e293b",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#94a3b8" },
      "&.Mui-focused fieldset": { borderColor: "#1d4ed8", borderWidth: "1.5px" },
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#94a3b8",
      opacity: 1,
    },
  };

  const labelSx = {
    fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#1e293b",
    mb: 0.75,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          px: { xs: 2, sm: 3 },
          py: 3,
          fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
        <Box>
          <DialogTitle
            sx={{
              p: 0,
              fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
              fontSize: "1.55rem",
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            Book Your Shipment
          </DialogTitle>
          <Typography
            sx={{
              fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
              fontSize: "0.875rem",
              color: "#64748b",
              mt: 0.75,
            }}
          >
            Fill in your shipment details and we'll get in touch to confirm pickup and delivery.
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#64748b",
            mt: 0.25,
            "&:hover": { backgroundColor: "#f1f5f9", color: "#1e293b" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, mt: 2.5, overflow: "visible" }}>
        {submitSuccess ? (
          <Alert
            severity="success"
            sx={{
              borderRadius: "10px",
              mb: 2.5,
              "& .MuiAlert-message": {
                fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
                fontSize: "0.9rem",
              },
            }}
          >
            Booking submitted successfully. Our team will contact you shortly.
          </Alert>
        ) : null}

        {submitError ? (
          <Alert
            severity="error"
            sx={{
              borderRadius: "10px",
              mb: 2.5,
              "& .MuiAlert-message": {
                fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
                fontSize: "0.9rem",
              },
            }}
          >
            {submitError}
          </Alert>
        ) : null}
        {/* ── Ship To Location ── */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={labelSx}>Ship To Location</Typography>
          <Autocomplete
            options={areas}
            value={location}
            onChange={(_, newValue) => {
              setLocation(newValue);
              setTouched((t) => ({ ...t, location: true }));
            }}
            popupIcon={<KeyboardArrowDownIcon sx={{ color: "#64748b" }} />}
            disabled={submitting || submitSuccess}
            PaperComponent={(props) => (
              <Paper
                {...props}
                sx={{
                  borderRadius: "10px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  border: "1px solid #e2e8f0",
                  mt: 0.5,
                  "& .MuiAutocomplete-listbox": {
                    py: 0.5,
                    "& .MuiAutocomplete-option": {
                      fontSize: "0.875rem",
                      color: "#1e293b",
                      fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
                      px: 2,
                      py: 1,
                      "&:hover": { backgroundColor: "#eff6ff" },
                      "&.Mui-focused": { backgroundColor: "#eff6ff" },
                      '&[aria-selected="true"]': {
                        backgroundColor: "#dbeafe",
                        fontWeight: 600,
                      },
                    },
                  },
                }}
              />
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={areasLoading ? "Loading areas..." : "Select location"}
                onBlur={() => setTouched((t) => ({ ...t, location: true }))}
                error={shouldShowError("location") && Boolean(fieldErrors.location)}
                helperText={shouldShowError("location") ? fieldErrors.location || " " : " "}
                sx={inputSx}
              />
            )}
          />
        </Box>

        {/* ── Your Name ── */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={labelSx}>Your Name</Typography>
          <TextField
            fullWidth
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTouched((t) => ({ ...t, name: true }));
            }}
            disabled={submitting || submitSuccess}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={shouldShowError("name") && Boolean(fieldErrors.name)}
            helperText={shouldShowError("name") ? fieldErrors.name || " " : " "}
            sx={inputSx}
          />
        </Box>

        {/* ── Mobile Number ── */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={labelSx}>Mobile Number</Typography>
          <TextField
            fullWidth
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
              setTouched((t) => ({ ...t, mobile: true }));
            }}
            disabled={submitting || submitSuccess}
            onBlur={() => setTouched((t) => ({ ...t, mobile: true }))}
            error={shouldShowError("mobile") && Boolean(fieldErrors.mobile)}
            helperText={shouldShowError("mobile") ? fieldErrors.mobile || " " : " "}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      pr: 1.25,
                      borderRight: "1px solid #e2e8f0",
                      mr: 0.5,
                    }}
                  >
                    {/* India flag emoji */}
                    <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>🇮🇳</span>
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        color: "#1e293b",
                        fontWeight: 500,
                        fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
                      }}
                    >
                      +91
                    </Typography>
                    <KeyboardArrowDownIcon sx={{ fontSize: "1rem", color: "#64748b" }} />
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{
              ...inputSx,
              "& .MuiInputAdornment-root": { mr: 0 },
            }}
          />
        </Box>

        {/* ── Goods Quantity + Goods Type ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
          {/* Quantity */}
          <Box>
            <Typography sx={labelSx}>Goods Quantity</Typography>
            <TextField
              fullWidth
              placeholder="Enter quantity (e.g., 10)"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty (clearing) or positive integers only
                if (val === "" || (Number(val) >= 1 && /^\d+$/.test(val))) {
                  setQuantity(val);
                  setTouched((t) => ({ ...t, quantity: true }));
                }
              }}
              type="number"
              inputProps={{ min: 1, step: 1 }}
              disabled={submitting || submitSuccess}
              onBlur={() => setTouched((t) => ({ ...t, quantity: true }))}
              error={shouldShowError("quantity") && Boolean(fieldErrors.quantity)}
              helperText={shouldShowError("quantity") ? fieldErrors.quantity || " " : " "}
              sx={{
                ...inputSx,
                "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
                  { opacity: 1 },
              }}
            />
          </Box>

          {/* Goods Type */}
          <Box>
            <Typography sx={labelSx}>Goods Type</Typography>
            <FormControl fullWidth>
              <Select
                value={goodsType}
                onChange={(e) => {
                  setGoodsType(e.target.value);
                  setTouched((t) => ({ ...t, goodsType: true }));
                }}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                disabled={submitting || submitSuccess}
                renderValue={(selected) =>
                  selected ? (
                    <Typography sx={{ fontSize: "0.9rem", color: "#1e293b", fontFamily: "var(--font-roboto, 'Roboto', sans-serif)" }}>
                      {selected}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: "0.9rem", color: "#94a3b8", fontFamily: "var(--font-roboto, 'Roboto', sans-serif)" }}>
                      Select goods type
                    </Typography>
                  )
                }
                sx={{
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  color: "#1e293b",
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1d4ed8",
                    borderWidth: "1.5px",
                  },
                  "& .MuiSvgIcon-root": { color: "#64748b" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: "10px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                      border: "1px solid #e2e8f0",
                      mt: 0.5,
                      "& .MuiMenuItem-root": {
                        fontSize: "0.875rem",
                        color: "#1e293b",
                        fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
                        px: 2,
                        py: 1,
                        "&:hover": { backgroundColor: "#eff6ff" },
                        "&.Mui-selected": {
                          backgroundColor: "#dbeafe",
                          fontWeight: 600,
                          "&:hover": { backgroundColor: "#dbeafe" },
                        },
                      },
                    },
                  },
                }}
              >
                {GOODS_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {shouldShowError("goodsType") && fieldErrors.goodsType ? (
              <Typography
                sx={{
                  mt: 0.75,
                  ml: 1.75,
                  fontSize: "0.75rem",
                  color: "#d32f2f",
                  fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
                }}
              >
                {fieldErrors.goodsType}
              </Typography>
            ) : (
              <Typography sx={{ mt: 0.75, ml: 1.75, fontSize: "0.75rem", color: "transparent" }}>.</Typography>
            )}
          </Box>
        </Box>

        {/* ── Info Banner ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            px: 2,
            py: 1.5,
            mb: 3,
          }}
        >
          <InfoOutlinedIcon sx={{ color: "#1d4ed8", fontSize: "1.1rem", mt: "1px", flexShrink: 0 }} />
          <Typography
            sx={{
              fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
              fontSize: "0.85rem",
              color: "#1e40af",
              lineHeight: 1.5,
            }}
          >
            Our team will contact you shortly to confirm the details and schedule your shipment.
          </Typography>
        </Box>

        {/* ── Action Buttons ── */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            disabled={submitting}
            sx={{
              borderRadius: "10px",
              borderColor: "#e2e8f0",
              color: "#374151",
              fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
              fontWeight: 600,
              fontSize: "0.9rem",
              py: 1.4,
              textTransform: "none",
              "&:hover": {
                borderColor: "#94a3b8",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            {submitSuccess ? "Close" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            disabled={submitting || submitSuccess}
            sx={{
              borderRadius: "10px",
              backgroundColor: "#1d4ed8",
              color: "#fff",
              fontFamily: "var(--font-roboto, 'Roboto', sans-serif)",
              fontWeight: 700,
              fontSize: "0.9rem",
              py: 1.4,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(29,78,216,0.35)",
              "&:hover": {
                backgroundColor: "#1e40af",
                boxShadow: "0 6px 20px rgba(29,78,216,0.45)",
              },
            }}
          >
            {submitting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} sx={{ color: "#fff" }} />
                Submitting...
              </Box>
            ) : submitSuccess ? (
              "Submitted"
            ) : (
              "Submit Booking"
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BookShipmentDialog;
