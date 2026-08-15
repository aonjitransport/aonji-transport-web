"use client";

import Image from "next/image";
import Header from "@/components/Header";
import truckOnRoadPhoto from "../../../public/assets/truckonroad-aonji.png";
import warehouseBannerPhoto from "../../../public/assets/warehouse-bannerphoto.png";
import {
  LuBadgeCheck,
  LuClock3,
  LuGauge,
  LuHeadphones,
  LuPackage,
  LuShieldCheck,
  LuTruck,
  LuUsers,
  LuWarehouse,
} from "react-icons/lu";

const services = [
  {
    title: "Parcel & Package Delivery",
    desc: "Fast and secure delivery of parcels and packages across Rayalaseema with real-time updates.",
    icon: LuPackage,
  },
  {
    title: "Full Truck Load (FTL)",
    desc: "Dedicated trucks for large shipments ensuring safe and on-time delivery.",
    icon: LuTruck,
  },
  {
    title: "Part Load (PTL)",
    desc: "Cost-effective part load solutions for smaller shipments with reliable transit times.",
    icon: LuWarehouse,
  },
  {
    title: "Safe & Secure Handling",
    desc: "Your goods are handled with care and delivered safely with zero compromise on quality.",
    icon: LuShieldCheck,
  },
  {
    title: "On-Time Delivery",
    desc: "We value your time and ensure your shipments reach on schedule, every time.",
    icon: LuClock3,
  },
  {
    title: "Customer Support",
    desc: "Our support team is always ready to assist you with tracking, updates, and queries.",
    icon: LuHeadphones,
  },
];

const stats = [
  { value: "15+", label: "Years of Experience", icon: LuBadgeCheck },
  { value: "20K+", label: "Happy Customers", icon: LuUsers },
  { value: "50+", label: "Vehicles in Operation", icon: LuGauge },
  { value: "100%", label: "Safe Delivery", icon: LuShieldCheck },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="overflow-hidden bg-white">
        <div className="grid w-full md:grid-cols-[1fr_1.08fr]">
          <div className="px-4 pb-10 pt-12 sm:px-6 md:px-8 md:py-20 lg:px-12">
            <span className="inline-flex rounded-md bg-[#eaf1ff] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#2f66ff]">
              Our Services
            </span>

            <h1 className="mt-6 max-w-2xl font-bebas text-4xl font-extrabold leading-[1.05] tracking-wide text-[#101f4e] sm:text-5xl lg:text-6xl">
              Reliable Logistics Solutions Tailored For Your Business
            </h1>

            <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
              At Aonji Transport, we provide end-to-end logistics and parcel
              solutions with a strong focus on speed, safety, and customer
              satisfaction.
            </p>
          </div>

          <div className="relative min-h-[280px] overflow-hidden bg-white md:min-h-[460px]">
            <Image
              src={truckOnRoadPhoto}
              alt="Aonji transport truck on the road"
              fill
              sizes="(max-width: 768px) 100vw, 54vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white via-white/75 to-transparent" />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 md:px-8 lg:px-12">
        <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.title}
                  className="flex min-h-[250px] flex-col items-center justify-center rounded-md border border-slate-200 bg-white px-7 py-8 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                >
                  <Icon className="mb-7 h-16 w-16 stroke-[1.5] text-[#2456d6]" />
                  <h2 className="max-w-[180px] text-lg font-extrabold leading-tight text-[#101f4e]">
                    {service.title}
                  </h2>
                  <p className="mt-6 max-w-[230px] text-sm font-medium leading-6 text-slate-600">
                    {service.desc}
                  </p>
                </article>
              );
            })}
        </div>
      </section>

      <section className="bg-white px-4 pb-10 sm:px-6 md:px-8 lg:px-12">
        <div className="w-full">
          <div className="grid overflow-hidden rounded-xl bg-[#101f4e] md:grid-cols-[1fr_1.18fr]">
            <div className="px-7 py-9 sm:px-10 md:py-12">
              <h2 className="font-bebas text-4xl font-extrabold leading-tight tracking-wide text-white">
                We Deliver More Than Just Parcels - We Deliver Trust.
              </h2>
              <p className="mt-4 max-w-md text-sm font-medium leading-7 text-white/75">
                Choose Aonji Transport for a reliable and hassle-free logistics
                experience.
              </p>
            </div>

            <div className="relative min-h-[230px] bg-[#101f4e] md:min-h-full">
              <Image
                src={warehouseBannerPhoto}
                alt="Aonji warehouse logistics team"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-contain object-[right_center] md:object-cover md:object-right"
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#101f4e_0%,rgba(16,31,78,0.98)_28%,rgba(16,31,78,0.78)_45%,rgba(16,31,78,0.34)_66%,rgba(16,31,78,0.06)_88%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,31,78,0.04),rgba(16,31,78,0.14))]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-14 sm:px-6 md:px-8 lg:px-12">
        <div className="w-full">
          <div className="grid rounded-md bg-white shadow-[0_10px_26px_rgba(15,23,42,0.06)] sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center px-4 py-8 text-center ${
                    index > 0 ? "lg:border-l lg:border-slate-200" : ""
                  }`}
                >
                  <Icon className="mb-3 h-10 w-10 stroke-[1.6] text-[#2456d6]" />
                  <div className="text-4xl font-extrabold text-[#2456d6]">{stat.value}</div>
                  <p className="mt-1 text-sm font-extrabold text-[#101f4e]">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
