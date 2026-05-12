import { useState, useEffect } from "react";

export const useFavourites = () => {
  const [favourites, setFavourites] = useState([]);

  // Load favourites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favourites");
    if (saved) {
      setFavourites(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever favourites change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const addFavourite = (movieId) => {
    setFavourites((prev) =>
      prev.includes(movieId) ? prev : [...prev, movieId]
    );
  };

  const removeFavourite = (movieId) => {
    setFavourites((prev) => prev.filter((id) => id !== movieId));
  };

  const isFavourite = (movieId) => {
    return favourites.includes(movieId);
  };

  return { favourites, addFavourite, removeFavourite, isFavourite };
};
