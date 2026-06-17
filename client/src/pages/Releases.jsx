import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import useApi from "../hooks/useApi";
import Loading from "../components/Loading";
import { SearchIcon, Film } from "lucide-react";
import { dummyShowsData } from "../assets/assets";

const Releases = () => {
  const { request } = useApi();
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [releaseMovies, setReleaseMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = ['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Science Fiction', 'Thriller', 'Family'];

  const fetchMovies = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (search.trim()) {
        queryParams.append('search', search.trim());
      }
      if (selectedGenre !== "All") {
        queryParams.append('genre', selectedGenre);
      }

      const queryString = queryParams.toString();
      const [comingMovies, allMovies] = await Promise.all([
        request(`/api/movies?status=coming_soon${queryString ? `&${queryString}` : ''}`),
        request(`/api/movies${queryString ? `?${queryString}` : ''}`)
      ]);

      setComingSoonMovies(comingMovies);
      setReleaseMovies(allMovies);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search and genre update
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMovies();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedGenre]);

  // Filter dummy movies locally for visual fallback and consistency
  const filteredDummyMovies = dummyShowsData
    .filter(movie => {
      if (search.trim() && !movie.title.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      if (selectedGenre !== "All") {
        const matchesGenre = movie.genres.some(g => g.name.toLowerCase() === selectedGenre.toLowerCase());
        if (!matchesGenre) return false;
      }
      return true;
    })
    .map(movie => ({
      ...movie,
      _id: movie._id || String(movie.id),
      posterUrl: movie.poster_path,
      releaseDate: movie.release_date
    }));

  const dummyComingSoon = filteredDummyMovies.filter(m => m.status === 'upcoming' || m.status === 'coming_soon' || m.title === "Thunderbolts*" || m.title === "Lilo & Stitch");

  const displayedComingSoon = [
    ...comingSoonMovies,
    ...dummyComingSoon
  ].filter((movie, index, self) => 
    self.findIndex(m => m._id === movie._id || m.title === movie.title) === index
  );

  const displayedReleases = [
    ...releaseMovies,
    ...filteredDummyMovies
  ].filter((movie, index, self) => 
    self.findIndex(m => m._id === movie._id || m.title === movie.title) === index
  );

  return (
    <div className="relative my-32 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Filter and Search Section */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900/40 border border-gray-800 p-5 rounded-2xl backdrop-blur-md">
        <div className="relative w-full md:max-w-md">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie releases..."
            className="w-full bg-black/40 border border-gray-700/60 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-primary transition-colors text-sm"
          />
        </div>

        {/* Horizontal Genre tags */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1 scroll-smooth">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all duration-200 ${
                selectedGenre === g
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                  : "bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700/30"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          {/* Coming Soon Section */}
          <section className="mb-14">
            <h1 className="text-xl font-semibold my-6 text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" /> Coming Soon
            </h1>
            {displayedComingSoon.length > 0 ? (
              <div className="flex flex-wrap max-sm:justify-center gap-8">
                {displayedComingSoon.map((movie) => (
                  <MovieCard movie={movie} key={movie._id} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No coming soon movies available matching the filters.</p>
            )}
          </section>

          {/* Releases Section */}
          <section>
            <h2 className="text-xl font-semibold my-6 text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" /> Releases
            </h2>
            {displayedReleases.length > 0 ? (
              <div className="flex flex-wrap max-sm:justify-center gap-8">
                {displayedReleases.map((movie) => (
                  <MovieCard movie={movie} key={movie._id} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No movie releases available matching the filters.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Releases;
