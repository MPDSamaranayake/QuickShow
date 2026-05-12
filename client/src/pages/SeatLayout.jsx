import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";

const SeatLayouts = () => {

  const { id, date } = useParams();
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
  };

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

      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default SeatLayouts;