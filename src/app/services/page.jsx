"use client";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BusinessIcon from "@mui/icons-material/Business";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const services = [
  {
    title: "Parcel Transport",
    desc: "Fast and reliable parcel delivery for small and large shipments.",
    icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Business Logistics",
    desc: "Efficient bulk transport solutions for businesses.",
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Express Delivery",
    desc: "Same-day and next-day delivery options available.",
    icon: <FlashOnIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Warehousing",
    desc: "Secure storage and inventory handling services.",
    icon: <WarehouseIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Area Coverage",
    desc: "Serving across Andhra Pradesh, Telangana & Karnataka.",
    icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
  },
];

export default function ServicesPage() {
  return (
    <Box sx={{ bgcolor: "#f9fafc", minHeight: "100vh" }}>
      
      {/* 🔵 HERO SECTION */}
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Our Logistics Services
          </Typography>
          <Typography color="text.secondary">
            Reliable, fast, and secure transport solutions tailored for your business.
          </Typography>
        </Container>
      </Box>

      {/* 🟣 SERVICES GRID */}
      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: 3,
                  textAlign: "center",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ color: "#4f46e5", mb: 2 }}>
                    {service.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 🟡 HOW IT WORKS */}
      <Box sx={{ py: 8, bgcolor: "#eef2ff" }}>
        <Container>
          <Typography variant="h4" textAlign="center" mb={6} fontWeight="bold">
            How It Works
          </Typography>

          <Grid container spacing={4} textAlign="center">
            {[
              "Book Shipment",
              "We Pick Up",
              "Track in Real-Time",
              "Delivered Safely",
            ].map((step, i) => (
              <Grid item xs={12} md={3} key={i}>
                <Typography variant="h5" fontWeight="bold" color="#4f46e5">
                  {i + 1}
                </Typography>
                <Typography>{step}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 🟢 COVERAGE */}
      <Box sx={{ py: 8 }}>
        <Container textAlign="center">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Areas We Serve
          </Typography>
          <Typography color="text.secondary">
            Andhra Pradesh • Telangana • Karnataka
          </Typography>
        </Container>
      </Box>

      {/* 🔴 CTA */}
      <Box sx={{ py: 8, textAlign: "center", bgcolor: "#4f46e5", color: "#fff" }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Need Transport Service?
          </Typography>
          <Typography mb={3}>
            Get in touch with us today for fast and reliable delivery solutions.
          </Typography>

          <Button
            variant="contained"
            sx={{
              bgcolor: "#fff",
              color: "#4f46e5",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#e0e7ff" },
            }}
          >
            Contact Us
          </Button>
        </Container>
      </Box>
    </Box>
  );
}