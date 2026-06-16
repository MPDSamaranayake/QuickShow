import React, { useEffect, useState} from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { CheckIcon, StarIcon, Calendar, DeleteIcon } from 'lucide-react';
import { kConverter } from '../../lib/kConverter';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

const AddShows = () => {
    const currency = import.meta.env.REACT_APP_CURRENCY_SYMBOL || '$'
    const { request } = useApi();
    const [nowwPlayingMovies, setNowPlayingMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [dateTimeSelection, setDateTimeSelection] = useState({});
    const [dateTimeInput, setDateTimeInput] = useState('');
    const [showPrice, setShowPrice] = useState('');
    
    const fetchNowPlayingMovies = async () => {
        try {
            const data = await request('/api/movies');
            setNowPlayingMovies(data);
        } catch (error) {
            console.error("Failed to fetch movies for shows selection:", error);
        }
    };

    const handleDateTimeAdd = () => {
        if (!dateTimeInput) return;
        const [date, time] =dateTimeInput.split("T");
        if (!date || !time) return;

        setDateTimeSelection((prev) => {
            const times = prev[date] || [];
            if (!times.includes(time)) {
                return { ...prev, [date]: [...times, time] };
            }
            return prev;
        });
    };

    const handleRemoveTime = (date, time) => {
        setDateTimeSelection((prev) => {
            const filteredTimes = prev[date].filter((t) => t !== time);
            if (filteredTimes.length === 0) {
                const { [date]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [date]: filteredTimes,
            };
        });
    };

    const handleAddShowSubmit = async () => {
        if (!selectedMovie) {
            return toast.error("Please select a movie.");
        }
        if (!showPrice || Number(showPrice) <= 0) {
            return toast.error("Please enter a valid show price.");
        }
        if (Object.keys(dateTimeSelection).length === 0) {
            return toast.error("Please select at least one show date and time.");
        }

        try {
            const showsToCreate = [];
            Object.entries(dateTimeSelection).forEach(([date, times]) => {
                times.forEach((time) => {
                    const [hour, minute] = time.split(':').map(Number);
                    const [year, month, day] = date.split('-').map(Number);
                    // Generate Date in local time context
                    const showDateTime = new Date(year, month - 1, day, hour, minute);

                    showsToCreate.push({
                        movie: selectedMovie,
                        showDateTime,
                        showPrice: Number(showPrice)
                    });
                });
            });

            await request('/api/shows', {
                method: 'POST',
                body: JSON.stringify({ shows: showsToCreate })
            });

            toast.success("Shows added successfully!");
            setSelectedMovie(null);
            setShowPrice('');
            setDateTimeSelection({});
        } catch (error) {
            toast.error(error.message || "Failed to add shows.");
        }
    };

    useEffect(() => {
        fetchNowPlayingMovies();
    }, []);
    return nowwPlayingMovies.length > 0 ? (
        <>
            <Title text1="Add" text2="Shows" />
            <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>
            <div className='overflow-x-auto pb-4'>
                <div className='group flex flex-wrap gap-4 mt-4 w-max'>
                    {nowwPlayingMovies.map((movie) => (
                        <div
                            key={movie._id}
                            className='relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300'
                            onClick={() => setSelectedMovie(movie._id)}
                        >
                            <div className='relative rounded-lg overflow-hidden'>
                                <img src={movie.poster_path} alt="" className='w-full object-cover brightness-90' />
                                <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                                    <p className='flex items-center gap-1 text-gray-400'>
                                        <StarIcon className="w-4 h-4 text-primary fill-primary" />
                                        {movie.vote_average.toFixed(1)}
                                    </p>
                                    <p className='text-gray-300'>
                                        {kConverter(movie.vote_count)} Votes
                                    </p>
                                </div>
                            </div>
                            {selectedMovie === movie._id && (
                                <div className='absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded'>
                                    <CheckIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                                </div>
                            )}
                            <p className='font-medium truncate'>{movie.title}</p>
                            <p className='text-gray-400 text-sm'>{movie.release_date}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Show Price Input */}
            <div className='mt-8'>
                <label className='block text-sm font-medium mb-2'>Show Price</label>
                <div className='relative border border-gray-600 rounded-md w-56'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>{currency}</span>
                    <input
                        min={0}
                        type='number'
                        value={showPrice}
                        onChange={(e) => setShowPrice(e.target.value)}
                        placeholder="Enter show price"
                        className='outline-none bg-transparent w-full pl-10 pr-3 py-2 text-left'
                        aria-label='Show price'
                    />
                </div>
            </div>
            {/* Date and Time Selection */}
            <div className='mt-6'>
                <label className='block text-sm font-medium mb-2'> Select Date and Time</label>
                <div className='relative inline-block'>
                    <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                        type='datetime-local'
                        value={dateTimeInput}
                        onChange={(e) => setDateTimeInput(e.target.value)}
                        className="outline-none rounded-md pl-10"
                    />
                </div>
                <button onClick={handleDateTimeAdd} className='ml-3 bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer'>
                    Add Time
                </button>
            </div>
            {/* Display Selected Date and Time */}
            {Object.keys(dateTimeSelection).length > 0 && (
                <div className='mt-6'>
                    <h2 className='mb-2'>Selected Date-Time</h2>
                    <ul className='space-y-3'>
                    {Object.entries(dateTimeSelection).map(([date, times]) => (
                        <li key={date}>
                            <div className='font-medium'>{date}</div>
                            <div className='flex flex-wrap gap-2 mt-1 text-sm'>
                                {times.map((time) => (
                                    <div key={time} className='border border-primary px-2 py-1 flex items-center rounded'>
                                        <span>{time}</span>
                                        <DeleteIcon
                                            width={15}
                                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                                            onClick={() => handleRemoveTime(date, time)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            )}
            <button 
                onClick={handleAddShowSubmit}
                className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor=pointer'
            >
                Add Show
            </button>
        </>
    ) : (
        <Loading />
    );
};

export default AddShows
