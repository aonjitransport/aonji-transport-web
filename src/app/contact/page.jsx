"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import heroContactImage from "../../../public/assets/herocontact.png";
import networkMapImage from "../../../public/assets/networkmap.png";
import truckOnRoadImage from "../../../public/assets/truckonroad-aonji.png";
import {
  LuClock3,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSend,
  LuShieldCheck,
  LuSmile,
} from "react-icons/lu";

const locations = [
  "Tadipatri",
  "Anantapur",
  "Dharmavaram",
  "Kadapa",
  "Proddatur",
  "Hindupur",
  "Penukonda",
  "Puttaparthi",
  "Kurnool",
  "Nandyal",
  "Adoni",
  "Madhavaram",
  "Banaganapalli",
  "Kalyandurgam",
  "Yadiki",
  "Gooty",
  "Guntakal",
  "Pamidi",
  "Gorantla",
  "Allagadda",
  "Mydukur",
  "Nandikotkur",
  "Kodumur",
  "Yemmiganur",
  "Alur",
  "Veldurthi",
  "Dhone",
  "Nandavaram",
  "Tadimarri",
  "Pulivendla",
  "Badvel",
  "Rajampet",
  "Jammalamadugu",
  "Obulavaripalli",
  "Vontimitta",
  "Kamalapuram",
  "Kaikalur",
  "Thamballapalle",
  "Sidhout",
  "Somandepalli",
  "Chennur",
  "Brahmavarappadu",
  "Mylavaram",
  "Garladinne",
  "Pileru",
  "Khajipet",
  "Madakasira",
];

const trustPoints = [
  { label: "15+ Years of Trust", icon: LuShieldCheck },
  { label: "On-Time Delivery", icon: LuClock3 },
  { label: "Safe & Secure", icon: LuShieldCheck },
  { label: "Customer First", icon: LuSmile },
];

const initialForm = {
  name: "",
  phoneNumber: "",
  email: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const errors = useMemo(() => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your name";
    if (!/^\d{10}$/.test(form.phoneNumber)) next.phoneNumber = "Enter a 10-digit phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email";
    if (form.message.trim().length < 10) next.message = "Message must be at least 10 characters";
    return next;
  }, [form]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setStatus({ type: "", text: "" });

    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/public/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phoneNumber: form.phoneNumber,
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ type: "error", text: data?.error || "Failed to send message. Please try again." });
        return;
      }

      setForm(initialForm);
      setSubmitAttempted(false);
      setStatus({ type: "success", text: "Message sent successfully. Our team will contact you shortly." });
    } catch {
      setStatus({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="relative min-h-[430px] overflow-hidden bg-[#101f4e] px-4 py-16 sm:px-6 md:min-h-[440px] md:px-8 lg:px-12">
        <Image
          src={heroContactImage}
          alt="Aonji Transport customer support team"
          fill
          sizes="100vw"
          className="object-cover object-[68%_center]"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#101f4e_0%,rgba(16,31,78,0.96)_28%,rgba(16,31,78,0.74)_48%,rgba(16,31,78,0.28)_70%,rgba(16,31,78,0.04)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,31,78,0.1),rgba(16,31,78,0.2))]" />

        <div className="relative flex min-h-[300px] max-w-xl flex-col justify-center md:min-h-[312px]">
          <span className="text-xs font-extrabold uppercase tracking-wide text-white/80">
            Contact Us
          </span>
          <h1 className="mt-5 max-w-lg font-bebas text-5xl font-extrabold leading-[1.05] tracking-wide text-white sm:text-6xl">
            We're Here To Help You
          </h1>
          <p className="mt-6 max-w-sm text-sm font-semibold leading-6 text-white/85 sm:text-base">
            Have a question or need assistance with your shipment? Our team is
            always ready to assist you.
          </p>
        </div>
      </section>

      <section className="grid items-stretch gap-6 px-4 py-8 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-12">
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <h2 className="px-5 pt-6 font-bebas text-3xl font-extrabold tracking-wide text-[#101f4e] sm:px-6">
            Get In Touch
          </h2>

          <div className="mt-3 flex flex-1 flex-col">
            <InfoRow
              icon={LuPhone}
              title="Call Us"
              lines={["+91 81062 26616", "+91 63017 98974"]}
            />
            <InfoRow
              icon={LuMail}
              title="Email Us"
              lines={["aonjitransport@gmail.com"]}
            />
            <InfoRow
              icon={LuMapPin}
              title="Our Head Office"
              lines={[
                "Beside New RTC Bus Stand, Mydukur Road, Proddatur,",
                "Kadapa Dist., Andhra Pradesh - 516360.",
              ]}
            />
            <InfoRow
              icon={LuClock3}
              title="Working Hours"
              lines={["Mon - Sat: 8:00 AM - 8:00 PM", "Sunday: 8:00 AM - 2:00 PM"]}
              last
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-6"
        >
          <h2 className="font-bebas text-3xl font-extrabold tracking-wide text-[#101f4e]">
            Send Us a Message
          </h2>

          {status.text ? (
            <div
              className={`mt-4 rounded-md border px-4 py-3 text-sm font-semibold ${
                status.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {status.text}
            </div>
          ) : null}

          <div className="mt-5 grid flex-1 gap-4">
            <FieldError show={submitAttempted} error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className={inputClass}
                placeholder="Your Name"
              />
            </FieldError>

            <FieldError show={submitAttempted} error={errors.phoneNumber}>
              <input
                value={form.phoneNumber}
                onChange={(e) => setField("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={inputClass}
                placeholder="Phone Number"
                inputMode="numeric"
              />
            </FieldError>

            <FieldError show={submitAttempted} error={errors.email}>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className={inputClass}
                placeholder="Email Address"
                type="email"
              />
            </FieldError>

            <FieldError show={submitAttempted} error={errors.message}>
              <textarea
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                className={`${inputClass} min-h-36 resize-y`}
                placeholder="Your Message"
              />
            </FieldError>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1956df] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_22px_rgba(25,86,223,0.22)] transition hover:bg-[#1648ba] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Sending..." : "Send Message"}
              <LuSend className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>




      <section className="relative min-h-[660px] overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(0,116,255,0.5),transparent_36%),linear-gradient(135deg,#051341_0%,#063398_55%,#020d38_100%)] px-6 py-10 sm:px-8 lg:min-h-[720px] lg:px-12 lg:py-14">
        <Image
          src={networkMapImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-42 mix-blend-screen"
          priority
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_67%_42%,rgba(0,116,255,0.18),transparent_32%),linear-gradient(90deg,rgba(3,13,56,0.94)_0%,rgba(3,31,105,0.72)_45%,rgba(3,13,56,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,8,35,0.2)_0%,rgba(1,8,35,0.06)_42%,rgba(1,8,35,0.5)_100%)]" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center text-center">
          <h2 className="font-bebas text-5xl font-extrabold leading-none tracking-wide text-white sm:text-6xl">
            Our Network
          </h2>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-10 text-white sm:text-lg">
            We operate across Rayalaseema with a strong network of branches
            and delivery points.
          </p>

          <div className="mt-10 grid w-full grid-cols-2 gap-x-5 gap-y-4 rounded-2xl bg-[#021b62]/42 px-4 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] ring-1 ring-white/10 backdrop-blur-[2px] sm:grid-cols-3 sm:px-6 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-8">
            {locations.map((location) => (
              <div key={location} className="flex items-center gap-2 text-left text-sm font-bold text-white sm:text-base">
                <LuMapPin className="h-5 w-5 flex-shrink-0 text-white" />
                {location}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ icon: Icon, title, lines, last = false }) {
  return (
    <div className={`flex gap-4 p-5 ${last ? "" : "border-b border-slate-100"}`}>
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#101f4e] text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-[#101f4e]">{title}</h3>
        <div className="mt-1 space-y-0.5">
          {lines.map((line) => (
            <p key={line} className="text-sm font-semibold leading-5 text-slate-600">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function FieldError({ children, show, error }) {
  return (
    <label className="block">
      {children}
      <span className={`mt-1 block min-h-4 text-xs font-semibold text-red-600 ${show && error ? "" : "invisible"}`}>
        {error || "."}
      </span>
    </label>
  );
}
