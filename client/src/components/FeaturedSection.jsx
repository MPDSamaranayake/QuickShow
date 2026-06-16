import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
import useApi from '../hooks/useApi';
import Loading from './Loading';

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { request } = useApi();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await request('/api/movies?status=running');
        setMovies(data);
      } catch (error) {
        console.error('Failed to fetch featured movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return <div className="py-20 flex justify-center"><Loading /></div>;
  }

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
        <div className='relative flex items-center justify-between pt-20 pb-10'>
          <BlurCircle top="0" right="-80px" />
            <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
            <button onClick={() => navigate('/movies')} className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'> 
                View All
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
            </button>

        </div>
        <div className='flex gap-4 overflow-x-auto pb-4'>
          {movies.slice(0, 4).map((show) => (
            <MovieCard key={show._id} movie={show} />
          ))}
        </div>
        <div className='flex justify-center mt-20'>
          <button onClick={() => {navigate('/movies'); scrollTo(0,0)}}
          className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>
            Show more
          </button>

        </div>
    </div>
  )
}

export default FeaturedSection;
