"use client";

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  const fetchMe = useAuthStore((s) => s.fetchMe);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      fetchMe();
    }
  }, [hasHydrated, fetchMe]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
