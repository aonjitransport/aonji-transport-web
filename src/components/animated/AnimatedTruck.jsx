"use client"
import Image from "next/image"
import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import truckBgVec from '../../../public/assets/hstruckbg1.svg'
import truckVec from '../../../public/assets/hstruckvec1.svg'
import parcelVec from '../../../public/assets/parcelspngvec.png'

const AnimatedTruck = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ellipseMovement = scrollY * 0.09;
  const parcelMovement = scrollY * 0.05;
  const truckMovement = scrollY * 1.4;
  const truckZoom = 1 + scrollY * 0.00001;

  return (
    <div className="relative w-full h-full min-h-[420px]">

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
        <div className="relative  w-[90%] h-[90%]">
          <Image
            src={truckVec}
            alt="Aonji Transport Truck"
            fill
            className="object-contain translate-y-20 object-center"
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
          className="object-contain translate-y-36 translate-x-44 scale-[.4] object-center"
        />
      </motion.div>

      

    </div>
  );
};

export default AnimatedTruck;