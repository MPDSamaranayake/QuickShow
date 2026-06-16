import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import isoTimeFormat from "../lib/isoTimeFormat";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import useApi from "../hooks/useApi";
import toast from "react-hot-toast";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$';
  const { request } = useApi();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getBookings = async () => {
    try {
      setIsLoading(true);
      const data = await request('/api/bookings');
      setBookings(data);
    } catch (error) {
      console.error("Failed to load user bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePayment = async (bookingId) => {
    try {
      await request(`/api/bookings/${bookingId}/payment`, {
        method: 'POST',
        body: JSON.stringify({ status: 'success' })
      });
      toast.success("Payment successful! Ticket booked.");
      getBookings();
    } catch (error) {
      toast.error(error.message || "Payment verification failed.");
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px"/>
      <div>
        <BlurCircle bottom="0px" right="600px"/>
      </div>
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-gray-400 mt-10">You have no bookings yet. Go book a movie!</div>
      ) : (
        bookings.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-1 max-w-3xl">
            <div className="flex flex-col p-4">
              <img src={item.show.movie.poster_path} alt="" className="md:max-w-45
              aspect-video h-auto object-cover object-bottom rounded "/>
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">{item.show.movie.title}</p>
                <p className="text-gray-400 text-sm">{timeFormat(item.show.movie.runtime)}</p>
                <p className="text-gray-400 text-sm mt-auto">{dateFormat(item.show.showDateTime)}</p>
              </div>
            </div>
            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">{currency}{item.amount}</p>
                {!item.isPaid && (
                  <button 
                    onClick={() => handlePayment(item._id)}
                    className="bg-primary hover:bg-primary-dull transition text-white px-5 py-2 mb-3 text-base rounded-full font-medium cursor-pointer"
                  >
                    Pay Now
                  </button>
                )}
              </div>
              <div className="text-sm">
                <p><span className="text-gray-400">Booking ID:</span> <span className="font-mono text-primary font-semibold">{item.bookingId}</span></p>
                <p><span className="text-gray-400">Total Tickets:</span> {item.bookedSeats.length}</p>
                <p><span className="text-gray-400">Seat Numbers:</span> {item.bookedSeats.join(', ')}</p>
                <p><span className="text-gray-400">Status:</span> <span className={`capitalize font-semibold ${item.status === 'confirmed' ? 'text-green-500' : item.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'}`}>{item.status}</span></p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  ) : <Loading />
}

export default MyBookings;