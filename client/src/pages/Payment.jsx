import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCardIcon, LockIcon, CalendarIcon,
  TicketIcon, ChevronLeftIcon, CheckCircleIcon,
  LoaderCircleIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import BlurCircle from '../components/BlurCircle';
import isoTimeFormat from '../lib/isoTimeFormat';
import useApi from '../hooks/useApi';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { request } = useApi();
  const currency = import.meta.env.VITE_CURRENCY || '₹';

  const state = location.state;

  // Guard: redirect if no booking state passed
  useEffect(() => {
    if (!state?.showId || !state?.selectedSeats?.length) {
      toast.error('No booking data found. Please start over.');
      navigate('/movies');
    }
  }, [state]);

  const {
    movieId, movieTitle, moviePoster,
    showId, showTime, date,
    selectedSeats = [], totalAmount = 0, showPrice = 0
  } = state || {};

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi'
  const [upiId, setUpiId] = useState('');

  // Format card number with spaces
  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry MM/YY
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validateForm = () => {
    if (paymentMethod === 'card') {
      if (cardName.trim().length < 2) {
        toast.error('Please enter the cardholder name.'); return false;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number.'); return false;
      }
      if (expiry.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY).'); return false;
      }
      if (cvv.length < 3) {
        toast.error('Please enter a valid CVV.'); return false;
      }
    } else {
      if (!upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID.'); return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    try {
      // Step 1: Lock seats
      await request('/api/bookings/lock', {
        method: 'POST',
        body: JSON.stringify({ showId, seats: selectedSeats })
      });

      // Step 2: Create pending booking
      const booking = await request('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ showId, seats: selectedSeats })
      });

      // Step 3: Confirm payment (simulate success)
      const confirmed = await request(`/api/bookings/${booking._id}/payment`, {
        method: 'POST',
        body: JSON.stringify({ status: 'success' })
      });

      toast.success('Payment successful! Your booking is confirmed.');

      navigate('/booking-confirmation', {
        replace: true,
        state: {
          booking: confirmed.booking || booking,
          movieTitle,
          moviePoster,
          selectedSeats,
          totalAmount,
          showTime,
          date,
        }
      });
      scrollTo(0, 0);
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!state) return null;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-40 pt-28 md:pt-40 pb-20 relative">
      <BlurCircle top="-100px" left="-100px" />
      <BlurCircle bottom="0px" right="0px" />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-8 cursor-pointer"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Seats
      </button>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Order Summary ── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

          <div className="bg-primary/10 border border-primary/20 rounded-xl overflow-hidden">
            {moviePoster && (
              <img
                src={moviePoster}
                alt={movieTitle}
                className="w-full h-44 object-cover object-top"
              />
            )}
            <div className="p-5 space-y-3">
              <p className="font-semibold text-base truncate">{movieTitle}</p>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                {showTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-medium">🕐</span>
                    <span>{isoTimeFormat(showTime)}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <TicketIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{selectedSeats.join(', ')}</span>
                </div>
              </div>

              <div className="border-t border-primary/20 pt-3 space-y-1">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{selectedSeats.length} × {currency}{showPrice}</span>
                  <span>{currency}{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Convenience fee</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-white text-base pt-1 border-t border-primary/20">
                  <span>Total</span>
                  <span className="text-primary">{currency}{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
            <LockIcon className="w-3.5 h-3.5" />
            <span>All transactions are encrypted and secure.</span>
          </div>
        </div>

        {/* ── Payment Form ── */}
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

          {/* Method selector */}
          <div className="flex gap-3 mb-6">
            {['card', 'upi'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition cursor-pointer
                  ${paymentMethod === method
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
              >
                {method === 'card' ? '💳 Credit / Debit Card' : '📱 UPI'}
              </button>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-5">
            {paymentMethod === 'card' ? (
              <>
                {/* Cardholder Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3
                      text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary
                      transition"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3
                        text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary
                        transition pr-12"
                    />
                    <CreditCardIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3
                        text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary
                        transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3
                        text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary
                        transition"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3
                    text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary
                    transition"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Example: name@okaxis, name@paytm, name@ybl
                </p>
              </div>
            )}

            {/* Pay Now Button */}
            <button
              onClick={handlePayment}
              disabled={processing || selectedSeats.length === 0}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                flex items-center justify-center gap-2
                ${processing || selectedSeats.length === 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dull text-white cursor-pointer active:scale-[0.98] shadow-lg shadow-primary/20'
                }`}
            >
              {processing ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  Processing Payment…
                </>
              ) : (
                <>
                  <LockIcon className="w-4 h-4" />
                  Pay {currency}{totalAmount} Securely
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              By clicking Pay, you agree to our{' '}
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
