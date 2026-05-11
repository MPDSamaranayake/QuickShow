import React, { useState } from 'react'
import ReactPlayer from 'react-player'
import { PlayCircleIcon } from 'lucide-react'
import { dummyTrailers } from '../assets/assets';
import BlurCircle from './BlurCircle';

const TrailerSection = () => {

    const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
       <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>

        <div className='relative mx-auto mt-6 w-full max-w-5xl'>
            <BlurCircle top="-100px" right="-100px" />
            <div className='relative aspect-video overflow-hidden rounded-2xl'>
              <ReactPlayer
                src={currentTrailer.videoUrl}
                controls
                light={currentTrailer.image}
                width="100%"
                height="100%"
                className="absolute inset-0"
              />
            </div>
        </div>

        <div className='mt-6 flex flex-wrap justify-center gap-4 pb-2'>
          {dummyTrailers.map((trailer, index) => (
            <button
              key={index}
              type='button'
              onClick={() => setCurrentTrailer(trailer)}
              className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition ${
                currentTrailer.videoUrl === trailer.videoUrl
                  ? 'border-primary'
                  : 'border-transparent hover:border-gray-500'
              }`}
            >
              <img
                src={trailer.image}
                alt='Trailer thumbnail'
                className='h-24 w-40 object-cover'
              />
              <PlayCircleIcon strokeWidth={1.6} className='absolute left-1/2 top-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2 ' />
          
            </button>
   ))}
        </div>
    </div>
  )
}

export default TrailerSection