"use client"
import Image from "next/image"
import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import truckBgVec from '../../../public/assets/hstruckbg1.svg'
import truckVec from '../../../public/assets/hstruckvec1.svg'
import parcelVec from '../../../public/assets/parcelspngvec.png'

const AnimatedTruck = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Tune these mobile values to adjust how far each layer moves while scrolling.
  const mobileMotion = {
    backgroundSpeed: 0.04,
    backgroundMax: 42,
    parcelSpeed: 0.06,
    parcelMax: 58,
    truckSpeed: 0.82,
    truckMax: 220,
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ellipseMovement = Math.min(scrollY * (isDesktop ? 0.09 : mobileMotion.backgroundSpeed), isDesktop ? 120 : mobileMotion.backgroundMax);
  const parcelMovement = Math.min(scrollY * (isDesktop ? 0.05 : mobileMotion.parcelSpeed), isDesktop ? 90 : mobileMotion.parcelMax);
  const truckMovement = Math.min(scrollY * (isDesktop ? 1.4 : mobileMotion.truckSpeed), isDesktop ? 900 : mobileMotion.truckMax);
  const truckZoom = 1 + scrollY * 0.00001;

  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[300px] md:min-h-[420px]">

      {/* Background circle — fills the container */}
      <motion.div
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
        animate={{ x: ellipseMovement }}
        transition={{ type: 'spring', stiffness: 20 }}
      >
        <Image
          src={truckBgVec}
          alt="background"
          fill
          className="object-contain object-center"
        />
      </motion.div>

      {/* Truck — slightly larger than bg, centered */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ willChange: 'transform' }}
        animate={{ x: -truckMovement, scale: truckZoom }}
        transition={{ type: 'spring', stiffness: 20 }}
      >
        <div className="relative w-[96%] h-[96%] md:w-[90%] md:h-[90%]">
          <Image
            src={truckVec}
            alt="Aonji Transport Truck"
            fill
            className="object-contain translate-y-8 sm:translate-y-12 md:translate-y-20 object-center"
          />
        </div>
      </motion.div>

       {/* Background circle — fills the container */}
      <motion.div
         className="absolute inset-0 z-20 flex items-center justify-center"
        style={{ willChange: 'transform' }}
        animate={{ x: parcelMovement }}
        transition={{ type: 'spring', stiffness: 20 }}
      >
        <Image
          src={parcelVec}
          alt="background"
          fill
          className="object-contain translate-y-20 translate-x-16 scale-[.34] sm:translate-y-24 sm:translate-x-28 sm:scale-[.36] md:translate-y-36 md:translate-x-44 md:scale-[.4] object-center"
        />
      </motion.div>

      

    </div>
  );
};

export default AnimatedTruck;
