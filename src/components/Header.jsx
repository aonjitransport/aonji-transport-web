"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BookShipmentDialog from "./BookShipmentDialog";
import logo from "../../public/ANJITLOG.svg";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const Header = () => {
  const pathname = usePathname();
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#101f4e] shadow-sm">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-8 lg:px-12">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              className="h-auto w-28 sm:w-32"
              alt="Aonji Transport"
              priority
            />
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            <nav className="flex items-center gap-8 text-sm font-medium text-white/75">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    href={link.href}
                    key={link.label}
                    className={active ? "text-white" : "transition hover:text-white"}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => setShipmentDialogOpen(true)}
              className="rounded-md bg-[#2f66ff] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2557df]"
            >
              Book Now
            </button>
          </div>

          <nav className="flex items-center gap-3 text-xs font-medium text-white/80 md:hidden">
            <Link
              href="/services"
              className={pathname === "/services" ? "text-white" : "hover:text-white"}
            >
              Services
            </Link>
            <Link href="/contact" className={pathname === "/contact" ? "text-white" : "hover:text-white"}>
              Contact
            </Link>
            <Link href="/faq" className={pathname === "/faq" ? "text-white" : "hover:text-white"}>
              FAQ
            </Link>
            <button
              type="button"
              onClick={() => setShipmentDialogOpen(true)}
              className="rounded bg-[#2f66ff] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#2557df]"
            >
              Book
            </button>
          </nav>
        </div>
      </header>

      <BookShipmentDialog
        open={shipmentDialogOpen}
        onClose={() => setShipmentDialogOpen(false)}
      />
    </>
  );
};

export default Header;
