import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarDaysIcon, ChevronRightIcon } from 'lucide-react'

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const dates = Object.keys(dateTime || {});

  const onBookHandler = () => {
    if (!selected) {
      return toast.error('Please select a date first.');
    }
    navigate(`/movies/${id}/${selected}`);
    scrollTo(0, 0);
  };

  const formatDay = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

  const formatDate = (dateStr) =>
    new Date(dateStr).getDate();

  const formatMonth = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });

  return (
    <div id='dateSelect' className='mt-16 md:mt-20 mb-16 md:mb-20'>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-10
        relative p-8 bg-primary/10 border border-primary/20 rounded-xl'>
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-5'>
            <CalendarDaysIcon className='w-5 h-5 text-primary' />
            <p className='text-lg font-semibold'>Choose Date</p>
          </div>

          {dates.length === 0 ? (
            <div className='flex items-center gap-2 text-gray-400 text-sm py-4'>
              <span>No show dates available for this movie.</span>
            </div>
          ) : (
            <div className='flex flex-wrap gap-3'>
              {dates.map((date) => {
                const isSelected = selected === date;
                const showCount = dateTime[date]?.length || 0;
                return (
                  <button
                    key={date}
                    onClick={() => setSelected(date)}
                    className={`flex flex-col items-center justify-center w-16 h-18 rounded-xl border-2 cursor-pointer
                      transition-all duration-200 active:scale-95 gap-0.5 pt-2 pb-2
                      ${isSelected
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                        : 'border-primary/40 hover:border-primary/70 hover:bg-primary/10 text-gray-300'
                      }`}
                  >
                    <span className={`text-[10px] font-medium uppercase tracking-wide
                      ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {formatDay(date)}
                    </span>
                    <span className='text-xl font-bold leading-tight'>{formatDate(date)}</span>
                    <span className={`text-[10px] font-medium uppercase
                      ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {formatMonth(date)}
                    </span>
                    <span className={`text-[9px] mt-0.5
                      ${isSelected ? 'text-white/70' : 'text-primary/70'}`}>
                      {showCount} show{showCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selected && (
            <p className='text-xs text-gray-400 mt-3'>
              <span className='text-primary font-medium'>{dateTime[selected]?.length}</span> showtime{dateTime[selected]?.length !== 1 ? 's' : ''} available on{' '}
              <span className='text-white'>
                {new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </p>
          )}
        </div>

        <button
          onClick={onBookHandler}
          disabled={!selected}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm
            transition-all duration-200 active:scale-95 shrink-0
            ${selected
              ? 'bg-primary hover:bg-primary-dull text-white cursor-pointer shadow-lg shadow-primary/20'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
            }`}
        >
          Book Now
          <ChevronRightIcon className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

export default DateSelect;