import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUpRightIcon, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import useApi from "../hooks/useApi";
import Loading from "../components/Loading";

const SeatLayouts = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

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
    } finally {
      setLoading(false);
    }
  }
  
  const handleSeatClick = (seatNumber) => {
    if (!selectedTime) {
      return toast.error("Please select a time first.");
    }
    if(!selectedSeats.includes(seatNumber) && selectedSeats.length > 4) {
      return toast.error("You can only select 5 seats.");
    }
    setSelectedSeats(prev => prev.includes(seatNumber) ? prev.filter(seat => seat !== seatNumber) : [...prev, seatNumber])
  }

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

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      return toast.error("Please select at least one seat.");
    }
    if (!selectedTime?.showId) {
      return toast.error("Please select a showtime.");
    }

    try {
      // 1. Lock seats temporarily
      await request('/api/bookings/lock', {
        method: 'POST',
        body: JSON.stringify({
          showId: selectedTime.showId,
          seats: selectedSeats
        })
      });

      // 2. Create pending booking
      await request('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          showId: selectedTime.showId,
          seats: selectedSeats
        })
      });

      toast.success("Seats locked. Proceeding to checkout...");
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.message || "Failed to initiate booking.");
    }
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
          buttonClass += 'bg-primary border-primary text-white cursor-pointer';
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
  )

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

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30
    md:pt-50">
      {/* Available Timing */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10
      h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {(show.dateTime?.[date] || []).map((item) => (
            <button
              key={item.showId}
              type="button"
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-full rounded-r-md cursor-pointer transition ${selectedTime?.showId === item.showId ? 'bg-primary text-white' : 'hover:bg-primary/20'}`}
            >
              <Clock3 className="w-4 h-4 shrink-0" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </button>
          ))}
        </div>
      </div>
      {/* Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px"/>
        <BlurCircle bottom="0px" right="0px"/>
        <h1 className="text-2xl font-semibold mb-2">Select your seat</h1>
        <div className="flex gap-4 text-xs mb-4">
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded border border-primary/60 bg-transparent"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-primary border-primary"></span> Selected</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-red-900/30 border border-red-900/60"></span> Booked</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-yellow-900/30 border border-yellow-900/60"></span> Reserved</span>
        </div>
        <img src={assets.screenImage} alt="Screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

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

        <button
          type="button"
          onClick={handleCheckout}
          className="mt-10 flex items-center gap-1 px-6 py-2 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowUpRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>

      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default SeatLayouts;