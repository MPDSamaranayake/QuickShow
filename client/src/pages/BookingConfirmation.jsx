import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircleIcon, TicketIcon, CalendarIcon,
  HashIcon, HomeIcon, ListOrderedIcon, DownloadIcon
} from 'lucide-react';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading';
import isoTimeFormat from '../lib/isoTimeFormat';
import useApi from '../hooks/useApi';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { request } = useApi();
  const currency = import.meta.env.VITE_CURRENCY || '₹';

  const state = location.state;

  // Allow fetching by bookingId query param as a fallback
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(!state?.booking);

  useEffect(() => {
    if (state?.booking) {
      setBookingData(state.booking);
      return;
    }
    // If navigated directly with a bookingId query param
    if (bookingIdParam) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          const data = await request(`/api/bookings/${bookingIdParam}`);
          setBookingData(data);
        } catch (err) {
          console.error('Failed to fetch booking:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    } else if (!state) {
      navigate('/movies');
    }
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loading /></div>;
  }

  // Derive display fields from either route state or fetched booking
  const movieTitle = state?.movieTitle || bookingData?.show?.movie?.title || 'Movie';
  const moviePoster = state?.moviePoster || bookingData?.show?.movie?.poster_path;
  const selectedSeats = state?.selectedSeats || bookingData?.bookedSeats || [];
  const totalAmount = state?.totalAmount ?? bookingData?.amount ?? 0;
  const showTime = state?.showTime || bookingData?.show?.showDateTime;
  const date = state?.date || (bookingData?.show?.showDateTime
    ? new Date(bookingData.show.showDateTime).toISOString().split('T')[0]
    : null);

  const bookingId = bookingData?.bookingId || '—';
  const transactionId = bookingData?.paymentDetails?.transactionId || '—';
  const status = bookingData?.status || 'confirmed';

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      })
    : '';

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-40 pt-28 md:pt-40 pb-20 relative">
      <BlurCircle top="-80px" left="-80px" />
      <BlurCircle bottom="100px" right="-80px" />

      <div className="max-w-2xl mx-auto">

        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center
              animate-[pulse_2s_ease-in-out_infinite]">
              <CheckCircleIcon className="w-12 h-12 text-green-400" strokeWidth={1.5} />
            </div>
            {/* Ring animation */}
            <div className="absolute inset-0 rounded-full border-2 border-green-500/30
              animate-[ping_1.5s_ease-in-out_1]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Booking Confirmed!</h1>
          <p className="text-gray-400 text-sm mt-2">
            Your seats are booked. Enjoy the movie! 🎬
          </p>
        </div>

        {/* Ticket Card */}
        <div className="bg-primary/8 border border-primary/25 rounded-2xl overflow-hidden relative">

          {/* Perforation line */}
          <div className="absolute left-0 right-0 flex items-center"
            style={{ top: '200px' }}>
            <div className="w-5 h-5 rounded-full bg-[#1e1e1e] -ml-2.5 border-r border-primary/20" />
            <div className="flex-1 border-t-2 border-dashed border-primary/20 mx-1" />
            <div className="w-5 h-5 rounded-full bg-[#1e1e1e] -mr-2.5 border-l border-primary/20" />
          </div>

          {/* Movie banner */}
          {moviePoster && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={moviePoster}
                alt={movieTitle}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e1e1e]/90" />
              <p className="absolute bottom-4 left-5 text-xl font-bold text-white drop-shadow">
                {movieTitle}
              </p>
            </div>
          )}

          {/* Ticket Details */}
          <div className="p-6 pt-10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Date
                </div>
                <p className="text-sm font-semibold text-white">{formattedDate}</p>
                {showTime && (
                  <p className="text-primary text-xs mt-0.5 font-medium">
                    {isoTimeFormat(showTime)}
                  </p>
                )}
              </div>

              {/* Seats */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <TicketIcon className="w-3.5 h-3.5" />
                  Seats ({selectedSeats.length})
                </div>
                <p className="text-sm font-semibold text-white">
                  {selectedSeats.join(', ')}
                </p>
              </div>

              {/* Booking ID */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <HashIcon className="w-3.5 h-3.5" />
                  Booking ID
                </div>
                <p className="text-sm font-mono font-bold text-primary">{bookingId}</p>
              </div>

              {/* Total */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <span className="text-xs">💳</span>
                  Amount Paid
                </div>
                <p className="text-sm font-bold text-white">
                  {currency}{totalAmount}
                </p>
              </div>
            </div>

            {/* Transaction + Status */}
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-mono text-xs text-gray-300">{transactionId}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Payment Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                  ${status === 'confirmed'
                    ? 'bg-green-500/15 text-green-400'
                    : status === 'cancelled'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                  }`}>
                  {status === 'confirmed' ? '✓ Paid' : status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => { navigate('/my-bookings'); scrollTo(0, 0); }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
              bg-primary hover:bg-primary-dull text-white font-semibold text-sm
              transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <ListOrderedIcon className="w-4 h-4" />
            View My Bookings
          </button>
          <button
            onClick={() => { navigate('/'); scrollTo(0, 0); }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
              border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white
              font-semibold text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            Go Home
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          A confirmation will appear in your My Bookings section.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
