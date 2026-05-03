"use client";
import { useEffect, useRef, useState } from "react";
import { FaMedal, FaUsers, FaTruck, FaClock } from "react-icons/fa";

// ── CountUp hook ──────────────────────────────────────────────
function useCountUp(target: number, duration: number, triggered: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    let start = 0;
    const step = target / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [triggered, target, duration]);

  return count;
}

// ── Single stat card ──────────────────────────────────────────
function StatCard({
  icon,
  target,
  suffix,
  label1,
  label2,
  triggered,
  duration = 1800,
}: {
  icon: React.ReactNode;
  target: number;
  suffix: string;
  label1: string;
  label2: string;
  triggered: boolean;
  duration?: number;
}) {
  const count = useCountUp(target, duration, triggered);
  return (
    <div className="flex items-center gap-4 md:px-8 first:pl-0">
      <div className="bg-blue-800/50 rounded-full p-3 flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-white font-bebas text-3xl leading-none">
          {count}{suffix}
        </div>
        <div className="text-blue-300 font-roboto text-xs mt-0.5">
          {label1}<br />{label2}
        </div>
      </div>
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────
export default function StatsBar() {
  const ref = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect(); // fire once only
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="bg-[#0f1f4b] py-6 px-4 md:px-12 lg:px-20"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-blue-800">
        <StatCard icon={<FaMedal className="text-white text-2xl" />}  target={15}   suffix="+" label1="Years of"     label2="Experience"     triggered={triggered} duration={1200} />
        <StatCard icon={<FaUsers className="text-white text-2xl" />}  target={150}   suffix="+" label1="Regular"      label2="Clients"        triggered={triggered} duration={800} />
        <StatCard icon={<FaTruck className="text-white text-2xl" />}  target={10} suffix="+" label1="Lakhs of"   label2="Deliveries"      triggered={triggered} duration={1200} />
        <StatCard icon={<FaClock className="text-white text-2xl" />}  target={98}   suffix="%" label1="On-Time"      label2="Delivery Rate"  triggered={triggered} duration={1600} />
      </div>
    </section>
  );
}