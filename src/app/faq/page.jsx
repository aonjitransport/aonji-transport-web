"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import heroContactImage from "../../../public/assets/herocontact.png";
import warehouseBannerPhoto from "../../../public/assets/warehouse-bannerphoto.png";
import { FaLongArrowAltRight } from "react-icons/fa";
import {
  LuCalendarDays,
  LuChevronDown,
  LuChevronUp,
  LuCreditCard,
  LuHeadphones,
  LuMapPin,
  LuPackage,
  LuSearch,
  LuShieldCheck,
  LuTruck,
} from "react-icons/lu";

const topics = [
  { label: "Tracking", icon: LuMapPin },
  { label: "Booking", icon: LuCalendarDays },
  { label: "Delivery", icon: LuTruck },
  { label: "Payment", icon: LuCreditCard },
  { label: "Support", icon: LuHeadphones },
];

const faqGroups = [
  {
    title: "Booking & Shipments",
    subtitle: "Questions about booking, shipment types and requirements",
    icon: LuPackage,
    count: "04",
    color: "blue",
    questions: [
      {
        q: "How do I book a shipment?",
        a: "You can book a shipment by contacting Aonji Transport directly or by submitting a booking request through our website. Share the pickup, destination, sender, receiver, and shipment details, and our team will assist you with the booking process.",
      },
      {
        q: "What information is required to book a shipment?",
        a: "We typically need the sender and receiver details, pickup and destination locations, type of goods, number of packages, approximate quantity/weight, and any other relevant shipment information.",
      },
      {
        q: "What types of goods do you transport?",
        a: "We handle a wide range of regular commercial and personal goods suitable for parcel and transport services. Certain restricted, hazardous, or prohibited items may not be accepted. Please contact our team if you are unsure about a particular item.",
      },
      {
        q: "Can I send multiple packages in one shipment?",
        a: "Yes. Multiple packages can generally be booked under the same shipment, depending on the shipment details and available capacity. Our team can help you determine the best way to arrange larger consignments.",
      },
    ],
  },
  {
    title: "Tracking & Delivery",
    subtitle: "Track your shipment and learn about delivery",
    icon: LuMapPin,
    count: "05",
    color: "green",
    questions: [
      {
        q: "How can I track my shipment?",
        a: "Once your shipment is booked, you receive shipment/LR details that can be used to identify and track your consignment. You can also contact our team with your LR number for the latest shipment status.",
      },
      {
        q: "What is an LR number?",
        a: "An LR (Lorry Receipt) number is a unique reference number assigned to your shipment. It helps us identify your consignment and is useful when checking shipment details, status, billing, or delivery information.",
      },
      {
        q: "How long will my shipment take to arrive?",
        a: "Delivery time depends on the origin, destination, route, shipment type, and operational conditions. Our team can provide an estimated delivery timeline when your shipment is booked.",
      },
      {
        q: "Will I receive an update when my shipment is delivered?",
        a: "Yes. Shipment and delivery information can be updated against the LR. If you need confirmation or delivery documentation, you can contact our team with your LR number.",
      },
      {
        q: "What should I do if I cannot find my shipment status?",
        a: "If your shipment status is unavailable or hasn't been updated, contact Aonji Transport and provide your LR number. Our team can check the shipment details and provide you with the latest available information.",
      },
    ],
  },
  {
    title: "Payments & Billing",
    subtitle: "Charges, payment methods and invoices",
    icon: LuCreditCard,
    count: "03",
    color: "amber",
    questions: [
      {
        q: "What payment options are available?",
        a: "Payment options may vary depending on the shipment and customer arrangement. Our team will provide the applicable payment details when your shipment is booked or billed.",
      },
      {
        q: "How is the transportation charge calculated?",
        a: "Charges can depend on factors such as the origin and destination, type and quantity of goods, shipment size/weight, route, and applicable service requirements. The final amount will be communicated as part of the booking/billing process.",
      },
      {
        q: "Can I get an invoice or receipt for my shipment?",
        a: "Yes. Aonji Transport provides billing documentation for shipments. If you need a copy of an invoice or other billing document, please contact our team with the relevant shipment or LR details.",
      },
    ],
  },
  {
    title: "Safety & Responsibility",
    subtitle: "Insurance, restrictions and shipment safety",
    icon: LuShieldCheck,
    count: "03",
    color: "purple",
    questions: [
      {
        q: "How does Aonji Transport handle shipments safely?",
        a: "We take reasonable care throughout the shipment process, from booking and handling to transportation and delivery. Shipments are handled according to their nature and the operational requirements of the service.",
      },
      {
        q: "Are there any items that cannot be transported?",
        a: "Yes. Certain prohibited, hazardous, illegal, or restricted goods may not be accepted for transportation. If you are unsure whether a particular item can be shipped, please contact our team before booking.",
      },
      {
        q: "Do you provide insurance for shipments?",
        a: "Shipment insurance or additional protection may depend on the type of goods, declared value, and applicable terms and conditions. Please speak with our team before booking if your shipment requires insurance or additional coverage.",
      },
    ],
  },
  {
    title: "Support & Issues",
    subtitle: "Get help with delays, damages and other issues",
    icon: LuHeadphones,
    count: "03",
    color: "rose",
    questions: [
      {
        q: "What should I do if my shipment is delayed?",
        a: "If your shipment is delayed, contact our support team with your LR number. We can check the latest available status and help you understand the reason for the delay and the next expected update.",
      },
      {
        q: "What should I do if my shipment arrives damaged?",
        a: "Please contact Aonji Transport as soon as possible and provide the LR number along with relevant details and photographs of the shipment/package. Our team will review the matter and guide you through the next steps.",
      },
      {
        q: "How can I contact customer support?",
        a: "You can contact Aonji Transport through the Contact Us section of our website or reach out to our team using the available phone/contact details. For shipment-related queries, keeping your LR number ready will help us assist you faster.",
      },
    ],
  },
];

const colorStyles = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  purple: "bg-purple-50 text-purple-700",
  rose: "bg-rose-50 text-rose-700",
};

// Tweak these two values to reposition the FAQ photos.
// Lower the second value, like 30%, to show more of the top/head area.
const heroImagePosition = "68% 14%";
const helpBannerImagePosition = "70% 18%";

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState(0);
  const [openQuestion, setOpenQuestion] = useState("0-0");

  const filteredGroups = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return faqGroups;

    return faqGroups
      .map((group) => ({
        ...group,
        questions: group.questions.filter(
          (item) =>
            item.q.toLowerCase().includes(text) ||
            item.a.toLowerCase().includes(text) ||
            group.title.toLowerCase().includes(text)
        ),
      }))
      .filter((group) => group.questions.length > 0);
  }, [query]);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="relative min-h-[560px] overflow-hidden bg-[#101f4e] px-4 py-10 sm:px-6 md:px-8 lg:px-12">
        <Image
          src={heroContactImage}
          alt="Aonji Transport support team"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: heroImagePosition }}
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#071742_0%,rgba(7,23,66,0.96)_30%,rgba(7,23,66,0.68)_58%,rgba(7,23,66,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,23,66,0.06),rgba(7,23,66,0.2))]" />

        <div className="relative z-10 flex min-h-[460px] max-w-2xl flex-col justify-center">
          
          <span className=" inline-flex w-fit rounded-md bg-[#2f66ff] px-4 py-2 text-sm font-extrabold uppercase text-white">
            FAQs
          </span>
          <h1 className="mt-6 max-w-xl text-5xl font-extrabold leading-tight text-white sm:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 max-w-lg text-lg font-medium leading-8 text-white/90">
            Find answers to the most common questions about our services,
            deliveries, and policies.
          </p>
          <div className="mt-8 flex items-center gap-4 text-white">
            <LuHeadphones className="h-9 w-9" />
            <div>
              <p className="font-extrabold">Can't find what you're looking for?</p>
              <p className="text-white/85">Our team is ready to help.</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="mt-5 inline-flex w-fit items-center gap-3 rounded-md bg-[#2f66ff] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#2454d6]"
          >
            Contact Us
            <FaLongArrowAltRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:px-8 lg:px-12">
        <div className="relative">
          <LuSearch className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#101f4e]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions..."
            className="h-16 w-full rounded-lg border border-slate-200 bg-white pl-16 pr-14 text-base font-semibold text-[#101f4e] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
          <LuSearch className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#101f4e]" />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="mr-2 text-base font-extrabold text-[#101f4e]">Popular Topics:</span>
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.label}
                onClick={() => setQuery(topic.label)}
                className="inline-flex items-center gap-3 rounded-md border border-slate-200 bg-white px-7 py-3 text-sm font-extrabold text-[#1956df] shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
              >
                <Icon className="h-5 w-5" />
                {topic.label}
              </button>
            );
          })}
        </div>

        <div className="mt-9 space-y-6">
          {filteredGroups.map((group, groupIndex) => {
            const Icon = group.icon;
            const expanded = openGroup === groupIndex;
            return (
              <article
                key={group.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-7"
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup(expanded ? -1 : groupIndex)}
                  className="flex w-full flex-wrap items-center gap-4 text-left sm:flex-nowrap sm:gap-5"
                >
                  <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg sm:h-16 sm:w-16 ${colorStyles[group.color]}`}>
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </span>
                  <span className="min-w-[190px] flex-1">
                    <h2 className="text-xl font-extrabold text-[#101f4e] sm:text-2xl">{group.title}</h2>
                    <p className="mt-1 text-base font-medium text-slate-500">{group.subtitle}</p>
                  </span>
                  <span className={`ml-auto flex h-11 w-11 items-center justify-center rounded-full text-base font-extrabold sm:mr-5 sm:h-12 sm:w-12 sm:text-lg ${colorStyles[group.color]}`}>
                    {group.count}
                  </span>
                  {expanded ? <LuChevronUp className="h-6 w-6 text-[#101f4e]" /> : <LuChevronDown className="h-6 w-6 text-[#101f4e]" />}
                </button>

                {expanded ? (
                  <div className="mt-7 overflow-hidden rounded-lg border border-slate-200">
                    {group.questions.map((item, itemIndex) => {
                      const key = `${groupIndex}-${itemIndex}`;
                      const questionOpen = openQuestion === key;
                      return (
                        <div key={item.q} className="border-b border-slate-200 last:border-b-0">
                          <button
                            type="button"
                            onClick={() => setOpenQuestion(questionOpen ? "" : key)}
                            className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-lg font-extrabold ${
                              questionOpen ? "bg-blue-50 text-[#0f3f9f]" : "text-[#101f4e]"
                            }`}
                          >
                            {item.q}
                            <span className="text-2xl">{questionOpen ? "-" : "+"}</span>
                          </button>
                          {questionOpen ? (
                            <p className="bg-blue-50 px-5 pb-6 text-base font-medium leading-7 text-slate-700">
                              {item.a}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 md:px-8 lg:px-12">
        <div className="relative min-h-[380px] overflow-hidden rounded-xl bg-[#101f4e] p-8 sm:p-12">
          <Image
            src={warehouseBannerPhoto}
            alt="Aonji Transport warehouse support"
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: helpBannerImagePosition }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#071742_0%,rgba(7,23,66,0.96)_30%,rgba(7,23,66,0.62)_58%,rgba(7,23,66,0.08)_100%)]" />
          <div className="relative z-10 flex min-h-[280px] max-w-xl flex-col justify-center">
            <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Still Have Questions?
              <br />
              <span className="text-[#5d92ff]">We're Happy to Help!</span>
            </h2>
            <p className="mt-7 max-w-md text-base font-medium leading-7 text-white/90">
              Our support team is available to assist you with any shipment
              related queries.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-3 rounded-md bg-[#1956df] px-7 py-4 text-sm font-extrabold text-white">
                <LuHeadphones className="h-5 w-5" />
                Contact Us
                <FaLongArrowAltRight className="h-4 w-4" />
              </Link>
              <Link href="/shipment-tracking" className="inline-flex items-center gap-3 rounded-md border border-white/45 px-7 py-4 text-sm font-extrabold text-white">
                <LuMapPin className="h-5 w-5" />
                Track Shipment
                <FaLongArrowAltRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
