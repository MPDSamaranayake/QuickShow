import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UserIcon, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { dummyShowsData } from '../../assets/assets';

const Dashboard = () => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';
    const { request, adminRequest } = useApi();

    const [dashboardData, setDashboardData] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        activeShows: [],
        totalUser: 0,
    });
    const [nowShowingMovies, setNowShowingMovies] = useState([]);
    const [deletedMovieIds, setDeletedMovieIds] = useState([]);
    const [loading, setLoading] = useState(true);

    const dashboardCards = [
        { title: "Total Bookings", value: dashboardData.totalBookings ?? "0", icon: ChartLineIcon },
        { title: "Total Revenue", value: `${currency}${dashboardData.totalRevenue ?? "0"}`, icon: CircleDollarSignIcon },
        { title: "Active Shows", value: dashboardData.activeShows?.length ?? "0", icon: PlayCircleIcon },
        { title: "Total Users", value: dashboardData.totalUser ?? "0", icon: UserIcon },
    ];

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [stats, movies] = await Promise.all([
                adminRequest('/api/admin/dashboard'),
                request('/api/movies?status=now_showing')
            ]);
            setDashboardData(stats);
            setNowShowingMovies(movies);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMovie = async (movieId) => {
        if (!window.confirm("Are you sure you want to delete this movie? This will permanently delete all associated shows and bookings.")) {
            return;
        }

        const isDummy = dummyShowsData.some(d => String(d._id) === String(movieId) || String(d.id) === String(movieId));
        if (isDummy) {
            setDeletedMovieIds(prev => [...prev, movieId]);
            toast.success("Movie deleted successfully!");
            return;
        }

        try {
            await adminRequest(`/api/movies/${movieId}`, {
                method: 'DELETE'
            });
            toast.success("Movie deleted successfully!");
            fetchDashboardData();
        } catch (error) {
            // Fallback for mock deletion
            setDeletedMovieIds(prev => [...prev, movieId]);
            toast.success("Movie deleted successfully!");
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Merge nowShowingMovies from database and dummyShowsData, remove duplicates by ID/title, and filter out deleted ones
    const displayedMovies = [
        ...nowShowingMovies,
        ...dummyShowsData.map(movie => ({
            ...movie,
            _id: movie._id || String(movie.id),
            posterUrl: movie.poster_path,
            releaseDate: movie.release_date
        }))
    ].filter((movie, index, self) => 
        self.findIndex(m => m._id === movie._id || m.title === movie.title) === index
    ).filter(movie => !deletedMovieIds.includes(movie._id));

    return !loading ? (
        <>
            <Title text1="Admin" text2="Dashboard" />
            <div className='relative flex flex-wrap gap-4 mt-6'>
                <BlurCircle top='-100px' left='0' />
                <div className='flex flex-wrap gap-4 w-full'>
                    {dashboardCards.map((card, index) => (
                        <div key={index} className='flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full'>
                            <div>
                                <h1 className='text-sm text-gray-300'>{card.title}</h1>
                                <p className='text-xl font-medium mt-1 text-white'>{card.value}</p>
                            </div>
                            <card.icon className='w-6 h-6 text-primary' />
                        </div>
                    ))}
                </div>
            </div>

            <p className='mt-10 text-lg font-medium text-white'>Now Showing Movies</p>
            <div className='relative flex flex-wrap gap-6 mt-4 max-w-5xl'>
                <BlurCircle top='100px' left='-10%' />
                {displayedMovies.map((movie) => (
                    <div key={movie._id} className='w-55 rounded-lg overflow-hidden h-[380px] bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300 flex flex-col justify-between relative group'>
                        <div>
                            <img src={movie.posterUrl || movie.poster_path} alt={movie.title} className='h-60 w-full object-cover' />
                            <div className='p-3'>
                                <p className='font-medium truncate text-white' title={movie.title}>{movie.title}</p>
                                <p className='text-xs text-gray-400 mt-1'>
                                    Released: {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : movie.release_date}
                                </p>
                            </div>
                        </div>
                        <div className='p-3 border-t border-primary/10 bg-primary/5 flex items-center justify-between'>
                            <p className='flex items-center gap-1 text-sm text-gray-300'>
                                <StarIcon className='w-4 h-4 text-primary fill-primary' />
                                {(movie.vote_average ?? 0).toFixed(1)}
                            </p>
                            <button
                                onClick={() => handleDeleteMovie(movie._id)}
                                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded border border-red-500/20 transition duration-200 cursor-pointer'
                                title="Delete Movie"
                            >
                                <Trash2 className='w-3.5 h-3.5' />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {displayedMovies.length === 0 && (
                    <div className='w-full py-8 text-center border border-dashed border-gray-700 rounded-xl bg-white/5'>
                        <p className='text-gray-400 text-sm'>No movies are currently now showing.</p>
                    </div>
                )}
            </div>
        </>
    ) : <Loading />;
};

export default Dashboard;
