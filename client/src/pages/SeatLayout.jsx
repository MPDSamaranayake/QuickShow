import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUpRightIcon, Clock3, TicketIcon, IndianRupeeIcon } from "lucide-react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import useApi from "../hooks/useApi";
import Loading from "../components/Loading";

const SeatLayouts = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const { id, date } = useParams();
  const navigate = useNavigate();
  const { request, userId } = useApi();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const getShow = async () => {
    try {
      setLoading(true);
      const data = await request(`/api/movies/${id}`);
      setShow(data);
    } catch (error) {
      console.error("Failed to fetch movie details for seat layout:", error);
      toast.error("Failed to load show details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatNumber) => {
    if (!selectedTime) {
      return toast.error("Please select a showtime first.");
    }
    if (!selectedSeats.includes(seatNumber) && selectedSeats.length >= 5) {
      return toast.error("You can select a maximum of 5 seats.");
    }
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(seat => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  // Fetch live show occupied/locked seats when selected showtime changes
  useEffect(() => {
    if (selectedTime?.showId) {
      const fetchShowDetails = async () => {
        try {
          const details = await request(`/api/shows/${selectedTime.showId}`);
          setShowDetails(details);
        } catch (error) {
          console.error("Failed to fetch show details:", error);
        }
      };
      fetchShowDetails();
      setSelectedSeats([]);
    } else {
      setShowDetails(null);
    }
  }, [selectedTime]);

  const totalPrice = (showDetails?.showPrice || 0) * selectedSeats.length;
  const currency = import.meta.env.VITE_CURRENCY || '₹';

  const handleCheckout = () => {
    if (selectedSeats.length === 0) {
      return toast.error("Please select at least one seat.");
    }
    if (!selectedTime?.showId) {
      return toast.error("Please select a showtime.");
    }

    // Navigate to payment page with all booking state
    navigate('/payment', {
      state: {
        movieId: id,
        movieTitle: show?.movie?.title,
        moviePoster: show?.movie?.poster_path,
        showId: selectedTime.showId,
        showTime: selectedTime.time,
        date,
        selectedSeats,
        totalAmount: totalPrice,
        showPrice: showDetails?.showPrice || 0,
      }
    });
    scrollTo(0, 0);
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, index) => {
          const seatNumber = `${row}${index + 1}`;
          const isBooked = showDetails?.occupiedSeats &&
            (seatNumber in showDetails.occupiedSeats || showDetails.occupiedSeats[seatNumber]);
          const isLockedByOthers = showDetails?.lockedSeats?.some(
            lock => lock.seatNumber === seatNumber && lock.userId !== userId
          );

          let buttonClass = 'w-7 h-7 rounded border text-[10px] flex items-center justify-center transition duration-200 ';
          let isDisabled = false;

          if (isBooked) {
            buttonClass += 'bg-red-900/30 text-red-500 border-red-900/60 cursor-not-allowed';
            isDisabled = true;
          } else if (isLockedByOthers) {
            buttonClass += 'bg-yellow-900/30 text-yellow-500 border-yellow-900/60 cursor-not-allowed';
            isDisabled = true;
          } else if (selectedSeats.includes(seatNumber)) {
            buttonClass += 'bg-primary border-primary text-white cursor-pointer scale-105 shadow-sm shadow-primary/40';
          } else {
            buttonClass += 'border-primary/60 hover:bg-primary/20 text-gray-300 cursor-pointer';
          }

          return (
            <button
              key={seatNumber}
              disabled={isDisabled}
              onClick={() => handleSeatClick(seatNumber)}
              className={buttonClass}
            >
              {seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    setSelectedTime(show?.dateTime?.[date]?.[0] || null);
    setSelectedSeats([]);
  }, [show, date]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loading /></div>;
  }

  if (!show) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Show not found.
      </div>
    );
  }

  const availableTimes = show.dateTime?.[date] || [];

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">

      {/* Sidebar — Timings + Summary */}
      <div className="w-full md:w-64 shrink-0 md:sticky md:top-30 h-max space-y-4">

        {/* Available Timings */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg py-6">
          <p className="text-base font-semibold px-6 mb-4">Available Timings</p>
          {availableTimes.length === 0 ? (
            <p className="text-sm text-gray-400 px-6">No showtimes for this date.</p>
          ) : (
            <div className="space-y-1">
              {availableTimes.map((item) => (
                <button
                  key={item.showId}
                  type="button"
                  onClick={() => setSelectedTime(item)}
                  className={`flex items-center gap-2 px-6 py-2 w-full rounded-r-md cursor-pointer transition ${
                    selectedTime?.showId === item.showId
                      ? 'bg-primary text-white'
                      : 'hover:bg-primary/20'
                  }`}
                >
                  <Clock3 className="w-4 h-4 shrink-0" />
                  <p className="text-sm">{isoTimeFormat(item.time)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-300">Booking Summary</p>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-400">
                <TicketIcon className="w-3.5 h-3.5" /> Seats
              </span>
              <span className="font-medium text-white">{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Quantity</span>
              <span className="font-medium text-white">{selectedSeats.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Price/seat</span>
              <span className="font-medium text-white">{currency}{showDetails?.showPrice || 0}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-primary font-bold text-lg">{currency}{totalPrice}</span>
            </div>
          </div>
        )}
      </div>

      {/* Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0px" right="0px" />
        <h1 className="text-2xl font-semibold mb-2">Select your seat</h1>

        {/* Legend */}
        <div className="flex gap-4 text-xs mb-4 flex-wrap justify-center">
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded border border-primary/60 bg-transparent"></span>
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-primary border-primary"></span>
            Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-red-900/30 border border-red-900/60"></span>
            Booked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-yellow-900/30 border border-yellow-900/60"></span>
            Reserved
          </span>
        </div>

        <img src={assets.screenImage} alt="Screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        {!selectedTime ? (
          <div className="text-gray-400 text-sm mt-4 mb-8 text-center">
            👈 Select a showtime from the left to load seats
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
              <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
                {groupRows[0].map(row => renderSeats(row))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-11">
              {groupRows.slice(1).map((group, index) => (
                <div key={index}>
                  {group.map(row => renderSeats(row))}
                </div>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={selectedSeats.length === 0 || !selectedTime}
          className={`mt-10 flex items-center gap-1 px-6 py-2 text-sm rounded-full font-medium transition active:scale-95
            ${selectedSeats.length > 0 && selectedTime
              ? 'bg-primary hover:bg-primary-dull text-white cursor-pointer'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
            }`}
        >
          {selectedSeats.length > 0
            ? `Proceed to Checkout — ${currency}${totalPrice}`
            : 'Select seats to continue'}
          <ArrowUpRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayouts;