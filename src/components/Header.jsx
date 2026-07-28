import Image from "next/image"
import logo from '../../public/ANJITLOG.svg'
import Link from "next/link"




const Header = () => {
  

  

  return (
    
    <>
    
    <div className="w-full p-1 bg-blue-950 flex justify-between sticky top-0 z-50 overflow-x-clip" >
      <Link href="/" className="flex items-center" >
      <Image src={logo} className="w-24 sm:w-28 mt-1 "  alt="logo"  />
      </Link>

      <div className=" flex items-center mr-1" >
        <ul className="font-roboto flex gap-2 justify-end text-xs sm:text-sm md:text-lg lg:text-xl sm:gap-3 lg:gap-8 lg:mr-4 text-gray-300">
          
          <li>
          <Link href="" className="hover:text-white"  >Services</Link>
          </li>
         <li>
         <Link href="" className="hover:text-white"  >About</Link>

         </li>
          <li>
          <Link href="" className="hover:text-white"  >Contact</Link>
          </li>
          <li>
          <Link href="" className="hover:text-white"  >FAQ</Link>
          </li>
          

          </ul>
          
        </div>

       

    </div>

    </>
  )
}

export default Header
