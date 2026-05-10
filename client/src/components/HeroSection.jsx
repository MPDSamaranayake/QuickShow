import React from 'react'
import { assets } from '../assets/assets'
import { Calendar1Icon, ClockIcon } from 'lucide-react'

const HeroSection = () => {
  return (
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("D:/QuickShow/client/src/assets/backgroundImage.png")]
     bg-cover bg-center h-screen'>

        <img src={assets.marvelLogo} alt='' className='max-h-11 lg:h-11 mt-20'/>

        <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold
        max-w-110'>Guardians <br /> of the Galaxy</h1>

        <div className='flex items-center gap-4 text-gray-300'>
            <span>Action | Adventure | Sci-Fi</span>
            <div className='flex items-center gap-1'>
                <Calendar1Icon className='w-4.5 h-4.5' />2028
                </div>
             <div className='flex items-center gap-1'>
                <ClockIcon className='w-4.5 h-4.5' />2h 8m
                </div>

        </div>

    </div>
  )
}

export default HeroSection