import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { useFavourites } from "../hooks/useFavourites";
import useApi from "../hooks/useApi";
import Loading from "../components/Loading";

const Favourite = () => {
  const { favourites } = useFavourites();
  const { request } = useApi();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await request('/api/movies');
        setMovies(data.filter(movie => favourites.includes(movie._id)));
      } catch (error) {
        console.error("Failed to load favorite movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [favourites]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loading /></div>;
  }

  return movies.length > 0 ? (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">

      <BlurCircle top="150px" left= "0px" />
      <BlurCircle bottom="50px" right= "50px" />
      <h1 className="text-lg font-medium my-4">Your Favourite Movies</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {movies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No favorite movies yet</h1>
    </div>
  );
};

export default Favourite;