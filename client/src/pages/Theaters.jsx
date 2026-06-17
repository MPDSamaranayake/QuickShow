import React, { useState, useEffect } from "react";
import BlurCircle from "../components/BlurCircle";
import useApi from "../hooks/useApi";
import Loading from "../components/Loading";
import { SearchIcon, MapPin, Tv, Phone, ShieldCheck } from "lucide-react";

const Theaters = () => {
  const { request } = useApi();
  const [dbTheaters, setDbTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const dummyTheaters = [
    {
      _id: "t1",
      name: "QuickShow Cinema Central",
      location: "Downtown Tech Hub, Block C",
      amenities: ["IMAX 3D", "Dolby Atmos Sound", "Luxury VIP Recliners", "Gourmet Food Hall"],
      phone: "+1 (555) 123-4567",
      screensCount: 4,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"
    },
    {
      _id: "t2",
      name: "Metroplex Cinemas",
      location: "Times Square Plaza, 42nd St",
      amenities: ["IMAX Laser", "Dolby Cinema", "D-BOX Motion Seats", "Classic Arcade"],
      phone: "+1 (555) 987-6543",
      screensCount: 8,
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80"
    },
    {
      _id: "t3",
      name: "Starlight Drive-in",
      location: "Sunset Boulevard, Drive 5",
      amenities: ["Retro Outdoor Screens", "Dolby Stereo FM Audio", "Vintage Snack Diner", "Pet Friendly"],
      phone: "+1 (555) 246-8135",
      screensCount: 2,
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80"
    },
    {
      _id: "t4",
      name: "Royal Gold Class Cinema",
      location: "Elite Promenade, Penthouse Suite",
      amenities: ["Ultra Luxury Beds", "Dolby Atmos 12.1", "Private Dining Room", "Personal Butler Services"],
      phone: "+1 (555) 135-7924",
      screensCount: 3,
      image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const data = await request("/api/theaters");
      setDbTheaters(data || []);
    } catch (error) {
      console.warn("Failed to fetch theaters from server, using dummy data fallback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  // Map database theaters to match formatting
  const formattedDbTheaters = dbTheaters.map(t => ({
    _id: t._id,
    name: t.name,
    location: t.location,
    amenities: ["Dolby Sound 7.1", "Standard Recliners", "Snack Counters"],
    phone: "+1 (555) 000-1111",
    screensCount: t.screens?.length || 1,
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80"
  }));

  // Merge datasets
  const allTheaters = [
    ...formattedDbTheaters,
    ...dummyTheaters
  ].filter((theater, index, self) =>
    self.findIndex(t => t.name.toLowerCase() === theater.name.toLowerCase()) === index
  );

  // Apply search query
  const filteredTheaters = allTheaters.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative my-32 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="120px" left="0px" />
      <BlurCircle bottom="100px" right="10%' px" />

      {/* Header section */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Theaters</h1>
        <p className="text-gray-400 max-w-xl">Find your nearest cinema hall, check amenities, and explore the best showtimes near you.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-10 max-w-lg bg-gray-900/40 border border-gray-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search theaters by name or location..."
            className="w-full bg-black/40 border border-gray-700/60 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-6xl">
          {filteredTheaters.map((t) => (
            <div key={t._id} className="group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/20 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden bg-black/30">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 right-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  {t.screensCount} {t.screensCount === 1 ? "Screen" : "Screens"}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-200">{t.name}</h3>
                
                <p className="mt-3 flex items-start gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{t.location}</span>
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{t.phone}</span>
                </p>

                {/* Amenities List */}
                <div className="mt-5 pt-5 border-t border-gray-800/80">
                  <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Amenities & Services</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {t.amenities.map((amenity, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-gray-300">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTheaters.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-gray-800 rounded-2xl bg-white/5">
              <p className="text-gray-400 text-sm">No theaters found matching the search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Theaters;
