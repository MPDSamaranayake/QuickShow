import React, { useState } from 'react';
import { StarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';

/**
 * StarRating — Reusable interactive star rating component.
 * Props:
 *   movieId       — MongoDB movie _id
 *   voteAverage   — current average rating (from movie data)
 *   userRating    — user's previously saved rating (1–5 or null)
 *   onRated       — optional callback(newVoteAverage, userRating) after a successful rating
 *   size          — 'sm' | 'md' (default 'md')
 */
const StarRating = ({ movieId, voteAverage = 0, userRating = null, onRated, size = 'md' }) => {
  const { request } = useApi();
  const [hovered, setHovered] = useState(null);
  const [myRating, setMyRating] = useState(userRating);
  const [avgRating, setAvgRating] = useState(voteAverage);
  const [submitting, setSubmitting] = useState(false);

  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  // The displayed fill level: hovered > committed user rating > nothing
  const displayLevel = hovered ?? myRating ?? 0;

  const handleRate = async (rating) => {
    if (submitting) return;
    if (!movieId) {
      toast.error('Cannot rate — movie ID is missing.');
      return;
    }

    // Optimistically update UI
    setMyRating(rating);
    setSubmitting(true);

    try {
      const res = await request(`/api/movies/${movieId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating }),
      });
      setAvgRating(res.vote_average ?? avgRating);
      if (onRated) onRated(res.vote_average, rating);
      toast.success(`You rated this ${rating} star${rating !== 1 ? 's' : ''}!`);
    } catch (err) {
      // Revert on failure
      setMyRating(userRating);
      toast.error(err.message || 'Failed to save rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayLevel;
          return (
            <button
              key={star}
              type="button"
              disabled={submitting}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHovered(star)}
              className={`transition-transform duration-100 ${submitting ? 'cursor-wait' : 'cursor-pointer hover:scale-110'}`}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <StarIcon
                className={`${starSize} transition-colors duration-150 ${
                  filled
                    ? 'text-primary fill-primary'
                    : 'text-gray-500 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-sm text-gray-300">
        <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>
        {myRating && (
          <span className="text-primary text-xs ml-1">(Your rating: {myRating}★)</span>
        )}
      </span>
    </div>
  );
};

export default StarRating;
