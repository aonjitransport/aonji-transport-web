"use client";
//app/page.tsx
import React from "react";
import Header from "../components/Header.jsx";
import AnimatedTruck from "../components/animated/AnimatedTruck.jsx";

import Lottie from "lottie-react";
import Link from "next/link";
import Footer from "../components/Footer.jsx";

import loadingAnimationData from "../../public/assets/animations/aonjiLoading.json";
import { useState, useEffect } from "react";
import Image from "next/image";
import timetruckimage from "../../public/assets/timetruckvec.png";
import safetruckimage from "../../public/assets/safetruckvec.png";
import fairtruckimage from "../../public/assets/fairtruckvec.png";
import growvecimage from "../../public/assets/growvec.png";
import excellancevecimage from "../../public/assets/excelvec.png";

import { FaMedal, FaUsers, FaTruck, FaClock, FaPhone } from "react-icons/fa";
import ctaBoxesImage from "../../public/assets/parcelspngvec.png"; // your vector image
import StatsBar from "../components/animated/StatsBar";
import step1Image from "../../public/assets/step1img.png";
import step2Image from "../../public/assets/step2img.png";
import step3Image from "../../public/assets/step3img.png";

import { motion } from "framer-motion";
import { Variants } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  Target,
} from "lucide-react";

const homePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the loading animation after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000); // Change 3000 to the desired duration in milliseconds

    return () => clearTimeout(timer); // Cleanup timeout on component unmount
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-62px)] gap-5 flex flex-col justify-center items-center">
        <div className=" flex   justify-center items-center">
          <Lottie
            animationData={loadingAnimationData}
            loop={true}
            className="flex justify-center items-center w-64 h-auto lg:w-[484px] lg:h-auto "
            alt="loading"
          />
        </div>
        <div>Loading...</div>
      </div>
    );
    // You can replace this with a spinner or fallback UI
  }

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut", // ✅ now valid because of Variants type
      },
    },
  };

  return (
    <>
      <Header />

      {/* section-1 Hero section   */}
      {/* section-1 Hero section */}
      {/* section-1 Hero section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-2 px-4 md:px-8 lg:px-12 items-center min-h-[calc(100vh-62px)] overflow-hidden  ">
        {/* LEFT CONTENT */}
        <div className="flex justify-start items-center py-8 md:py-0">
          <div className="max-w-xl">
            {/* TRUST BADGE */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-1.5 rounded-full text-xs font-semibold font-roboto mb-5 uppercase tracking-wide">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              15+ Years of Trust &amp; Reliability
            </div>

            {/* HEADING */}
            <h1 className="font-bebas font-extrabold text-4xl md:text-5xl lg:text-6xl text-indigo-900 tracking-wide leading-tight">
              Delivering Fast, Secure, and Reliable Logistics for Growing
              Businesses.
            </h1>

            {/* DESCRIPTION */}
            <p className="font-roboto text-base md:text-lg text-gray-600 mt-4 leading-relaxed">
              With 15+ years of experience, Aonji Transport delivers secure,
              on-time parcel solutions across industries. We handle your
              shipments with precision — so you can focus on growing your
              business.
            </p>

            {/* TRUST POINTS — icon row like reference */}
            <div className="flex flex-wrap gap-6 mt-5 text-gray-700 font-roboto text-sm">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-blue-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800 text-xs">
                    15+ Years
                  </div>
                  <div className="text-gray-500 text-xs">of Experience</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-blue-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800 text-xs">
                    Trusted by
                  </div>
                  <div className="text-gray-500 text-xs">20+ Businesses</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-blue-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800 text-xs">
                    Safe &amp; On-Time
                  </div>
                  <div className="text-gray-500 text-xs">Deliveries</div>
                </div>
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex gap-3 mt-6 flex-wrap items-center">
              <button className="flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium font-roboto rounded-lg text-sm px-6 py-3 transition-colors">
                Get a Free Quote →
              </button>

              <button className="py-3 px-5 text-sm font-medium text-gray-800 bg-white rounded-full border border-gray-300 hover:bg-gray-50 hover:text-blue-700 transition-colors">
                <Link href="/shipment-tracking">Track Your Parcel</Link>
              </button>

              <button className="flex items-center gap-2 py-3 px-5 text-sm font-medium text-gray-800 bg-white rounded-full border border-gray-300 hover:bg-gray-50 hover:text-blue-700 transition-colors">
                Talk to Us
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Truck, fills full height of section */}
        <div className="hidden md:flex justify-center items-center h-full w-full py-4">
          <div className="relative w-full h-[calc(100vh-62px)] max-h-[680px]">
            <AnimatedTruck />
          </div>
        </div>
      </section>

      {/* section-2 seaftey and secure  */}

      <section className="grid  lg:gap-8 md:grid-cols-2 lg:grid-cols-2 md:m-10 lg:mt-12 overflow-x-clip ">
        <div className="flex justify-center items-center order-last md:order-first lg:order-first ">
          <Image
            src={safetruckimage}
            alt="Safe & Secure"
            width={600}
            height={400}
            quality={100}
            className="w-full h-auto"
          />
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-xl bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 "
        >
          <div className="max-w-xl">
            <h1 className="font-bebas font-extrabold text-3xl lg:text-5xl text-indigo-800 tracking-wide">
              Your Shipments, Our Responsibility
            </h1>

            <p className="font-roboto text-lg text-gray-600 mt-4 leading-relaxed">
              Your shipments are critical to your business. At Aonji Transport,
              we ensure every parcel is handled with precision, care, and full
              accountability at every stage.
            </p>

            <ul className="mt-5 space-y-2 text-gray-700 font-roboto">
              <li>✔ Secure handling with verified safety protocols</li>
              <li>✔ Continuous monitoring throughout transit</li>
              <li>✔ Strong focus on damage prevention and reliability</li>
            </ul>

            <p className="mt-4 text-gray-600 font-roboto">
              We make sure your shipments arrive safely, on time, and exactly as
              expected.
            </p>
          </div>
        </motion.div>
      </section>

      {/* section 3 intime delivery */}

      <section className="grid  lg:gap-8 md:grid-cols-2 lg:grid-cols-2 md:m-10 lg:mt-12 overflow-x-clip ">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-xl bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="max-w-xl">
            <h1 className="font-bebas font-extrabold text-3xl lg:text-5xl text-indigo-800 tracking-wide">
              On-Time Delivery You Can Depend On, Every Single Time
            </h1>

            <p className="font-roboto text-lg text-gray-600 mt-4 leading-relaxed">
              Timing is critical in logistics. Our system is built to deliver
              speed, consistency, and reliability at every stage.
            </p>

            <ul className="mt-5 space-y-2 text-gray-700 font-roboto">
              <li>✔ Optimized routes for faster delivery</li>
              <li>✔ Efficient dispatch and coordination</li>
              <li>✔ Proactive delay management</li>
            </ul>

            <p className="mt-4 text-gray-600 font-roboto">
              We ensure your shipments arrive on schedule — helping you maintain
              trust and efficiency.
            </p>
          </div>
        </motion.div>

        <div className="flex justify-center items-center">
          <Image
            src={timetruckimage}
            alt="Timely Delivery"
            width={600}
            height={400}
            quality={100}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* section-4 fair prices */}

      <section className="grid  lg:gap-8 md:grid-cols-2 lg:grid-cols-2 md:m-10 lg:mt-12 overflow-x-clip ">
        <div className="flex justify-center items-center order-last md:order-first lg:order-first ">
          <Image
            src={fairtruckimage}
            alt="Fair Charges"
            width={600}
            height={400}
            quality={100}
            className="w-full h-auto"
          />
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-xl bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="max-w-xl">
            <h1 className="font-bebas font-extrabold text-3xl lg:text-5xl text-indigo-800 tracking-wide">
              Transparent Pricing with No Hidden Charges — Just Honest Value
            </h1>

            <p className="font-roboto text-lg text-gray-600 mt-4 leading-relaxed">
              Our pricing is designed to be clear, predictable, and fair —
              giving you full confidence before every shipment.
            </p>

            <ul className="mt-5 space-y-2 text-gray-700 font-roboto">
              <li>✔ Clear upfront pricing structure</li>
              <li>✔ No hidden fees or unexpected costs</li>
              <li>✔ Competitive rates with consistent value</li>
            </ul>

            <p className="mt-4 text-gray-600 font-roboto">
              You always know what you're paying for — and why it’s worth it.
            </p>
          </div>
        </motion.div>
      </section>

      {/* emopowering business */}

      <section className="grid my-3 lg:gap-8 md:grid-cols-2 lg:grid-cols-2 md:m-10 lg:mt-12 overflow-x-clip ">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-xl bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="max-w-xl">
            <h1 className="font-bebas font-extrabold text-3xl lg:text-5xl text-indigo-800 tracking-wide">
              Empowering Businesses with Reliable and Scalable Logistics
              Solutions
            </h1>

            <p className="font-roboto text-lg text-gray-600 mt-4 leading-relaxed">
              We go beyond delivery — we support your business growth with
              flexible and scalable logistics solutions.
            </p>

            <ul className="mt-5 space-y-2 text-gray-700 font-roboto">
              <li>✔ Scalable operations for growing demand</li>
              <li>✔ Flexible solutions tailored to your needs</li>
              <li>✔ Reliable performance to maintain customer trust</li>
            </ul>

            <p className="mt-4 text-gray-600 font-roboto">
              From startups to enterprises, we help you scale with confidence.
            </p>
          </div>
        </motion.div>

        <div className="flex justify-center items-center">
          <Image
            src={growvecimage}
            alt="Empowering Businesses"
            width={600}
            height={400}
            quality={100}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* exellence */}

      <section className="grid my-3 lg:gap-8 md:grid-cols-2 lg:grid-cols-2 md:m-10 lg:mt-12 overflow-x-clip ">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-xl bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="max-w-xl">
            <h1 className="font-bebas font-extrabold text-3xl lg:text-5xl text-indigo-800 tracking-wide">
              Our Mission: Delivering Excellence
            </h1>

            <p className="font-roboto text-lg text-gray-600 mt-4 leading-relaxed">
              Our mission is to deliver excellence through reliability, speed,
              and trust — ensuring every shipment meets the highest standards.
            </p>

            <ul className="mt-5 space-y-2 text-gray-700 font-roboto">
              <li>✔ Consistent and reliable delivery performance</li>
              <li>✔ Strong focus on customer satisfaction</li>
              <li>✔ Commitment to long-term partnerships</li>
            </ul>

            <p className="mt-4 text-gray-600 font-roboto">
              Every delivery is a promise — and we make sure it’s kept.
            </p>
          </div>
        </motion.div>

        <div className="flex justify-center items-center lg:order-first   ">
          <Image
            src={excellancevecimage}
            alt="Delivering Excellence"
            width={600}
            height={400}
            quality={100}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      {/* ============ HOW IT WORKS ============ */}
      <section className="py-12 px-4 md:px-12 lg:px-20 bg-white">
        {/* Section Title */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px bg-gray-300 w-16 md:w-32" />
          <h2 className="font-bebas text-2xl md:text-3xl tracking-widest text-indigo-900 whitespace-nowrap">
            HOW IT WORKS
          </h2>
          <div className="h-px bg-gray-300 w-16 md:w-32" />
        </div>

        {/* Steps Row */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-2">
          {/* ── Step 1 ── */}
          <div className="flex items-center gap-4 flex-1">
            {/* Badge + Image grouped */}
            <div className="relative flex-shrink-0">
              {/* Number badge — top-left overlap */}
              <div className="absolute -top-3 -left-3 z-10 w-9 h-9 rounded-full bg-blue-700 text-white font-bebas text-lg flex items-center justify-center shadow-md">
                1
              </div>
              {/* Image box */}
              <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src={step1Image}
                  alt="Book Shipment"
                  width={88}
                  height={88}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Text */}
            <div>
              <h3 className="font-roboto font-bold text-gray-900 text-base leading-snug">
                Book Your Shipment
              </h3>
              <p className="font-roboto text-sm text-gray-500 mt-1 leading-relaxed max-w-[180px]">
                Contact us or request a quote. We'll understand your
                requirements and schedule pickup.
              </p>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:flex items-center flex-shrink-0 px-1">
            <svg width="60" height="16" viewBox="0 0 60 16" fill="none">
              <line
                x1="0"
                y1="8"
                x2="48"
                y2="8"
                stroke="#93C5FD"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <path
                d="M48 4L56 8L48 12"
                stroke="#93C5FD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* ── Step 2 ── */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <div className="absolute -top-3 -left-3 z-10 w-9 h-9 rounded-full bg-blue-700 text-white font-bebas text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src={step2Image}
                  alt="We Handle & Transport"
                  width={88}
                  height={88}
                  className="object-contain"
                />
              </div>
            </div>

            <div>
              <h3 className="font-roboto font-bold text-gray-900 text-base leading-snug">
                We Handle &amp; Transport
              </h3>
              <p className="font-roboto text-sm text-gray-500 mt-1 leading-relaxed max-w-[180px]">
                Our team ensures safe handling and efficient transportation
                using optimized routes.
              </p>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:flex items-center flex-shrink-0 px-1">
            <svg width="60" height="16" viewBox="0 0 60 16" fill="none">
              <line
                x1="0"
                y1="8"
                x2="48"
                y2="8"
                stroke="#93C5FD"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <path
                d="M48 4L56 8L48 12"
                stroke="#93C5FD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* ── Step 3 ── */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <div className="absolute -top-3 -left-3 z-10 w-9 h-9 rounded-full bg-blue-700 text-white font-bebas text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src={step3Image}
                  alt="On-Time Delivery"
                  width={88}
                  height={88}
                  className="object-contain"
                />
              </div>
            </div>

            <div>
              <h3 className="font-roboto font-bold text-gray-900 text-base leading-snug">
                On-Time Delivery
              </h3>
              <p className="font-roboto text-sm text-gray-500 mt-1 leading-relaxed max-w-[180px]">
                Your parcel reaches its destination securely and on schedule —
                every time.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ============ END HOW IT WORKS ============ */}
      {/* ============ END HOW IT WORKS ============ */}

      {/* ============ STATS + CTA SECTION ============ */}

      {/* Stats Bar */}

      <StatsBar />

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-8 px-4 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Left — Illustration placeholder */}
          <div className="flex-shrink-0 w-full md:w-[300px] flex justify-center">
            <Image
              src={ctaBoxesImage}
              alt="Logistics illustration"
              width={320}
              height={220}
              className="object-contain w-full h-auto hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>

          {/* Middle — Text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-bebas text-2xl md:text-3xl lg:text-4xl text-indigo-900 tracking-wide leading-tight">
              Get Started with Reliable Logistics Solutions Tailored for Your
              Business
            </h2>
            <p className="font-roboto text-sm md:text-base text-gray-600 mt-2">
              Partner with Aonji Transport and experience dependable delivery,
              transparent pricing, and a team that truly understands your
              business needs.
            </p>
          </div>

          {/* Right — Buttons */}
          <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-roboto font-medium text-sm px-6 py-3 rounded-lg transition-colors whitespace-nowrap">
              Get a Free Quote →
            </button>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-700 text-gray-800 font-roboto font-medium text-sm px-6 py-3 rounded-lg transition-colors whitespace-nowrap">
              <FaPhone className="text-blue-600" />
              Talk to Our Team
            </button>
          </div>
        </div>
      </section>

      {/* ============ END STATS + CTA ============ */}
    </>
  );
};

export default homePage;
