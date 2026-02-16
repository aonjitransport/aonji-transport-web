import { useMediaQuery } from "react-responsive";

export function useBreakpoint() {
  const isMobile = useMediaQuery({ maxWidth: 768 }); // Mobile: width ≤ 768px
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 }); // Tablet: 769px – 1024px
  const isDesktop = useMediaQuery({ minWidth: 1025 }); // Desktop: width ≥ 1025px

  return { isMobile, isTablet, isDesktop };
}
