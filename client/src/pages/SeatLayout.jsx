import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUpRightIcon, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";

const SeatLayouts = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

  const { id, date } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const movie = dummyShowsData.find((item) => item._id === id)
    if (movie) {
      setShow({
        movie,
        dateTime: dummyDateTimeData,
      })
    }
  }
  
  const handleSeatClick = (seatNumber) => {
    if (!selectedTime) {
      return toast("Please select a time first.");
    }
    if(!selectedSeats.includes(seatNumber) && selectedSeats.length > 4) {
      return toast("You can only select 5 seats.");
    }
    setSelectedSeats(prev => prev.includes(seatNumber) ? prev.filter(seat => seat !== seatNumber) : [...prev, seatNumber])
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: count }, (_, index) => {
        const seatNumber = `${row}${index + 1}`;
        return (
          <button
            key={seatNumber}
            onClick={() => handleSeatClick(seatNumber)}
            className={`w-7 h-7 rounded border border-primary/60 cursor-pointer flex items-center justify-center text-[10px] ${selectedSeats.includes(seatNumber) ? 'bg-primary text-white' : ''}`}
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
              className={`flex items-center gap-2 px-6 py-2 w-full rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20'}`}
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
        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
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
          onClick={() => navigate('/my-bookings')}
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