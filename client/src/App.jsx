import React from "react"
import Navbar from "./components/Navbar"
import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Movies from "./pages/Movies"
import MovieDetails from "./pages/MovieDetails"
import SeatLayouts from "./pages/SeatLayout"
import MyBookings from "./pages/MyBookings"
import Favourite from "./pages/Favourite"
import Payment from "./pages/Payment"
import BookingConfirmation from "./pages/BookingConfirmation"
import { Toaster } from "react-hot-toast"
import Footer from "./components/Footer"
import Layout from "./pages/admin/Layout"
import Dashboard from "./pages/admin/Dashboard"
import AddShows from "./pages/admin/AddShows"
import ListShows from "./pages/admin/ListShows"
import ListBookings from "./pages/admin/ListBookings"
import AdminLogin from "./pages/admin/AdminLogin"
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute"
import Releases from "./pages/Releases"
import Theaters from "./pages/Theaters"
import { AdminAuthProvider } from "./context/AdminAuthContext"

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  return (
    <AdminAuthProvider>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        {/* Public user routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayouts />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favourites" element={<Favourite />} />
        <Route path="/favourite" element={<Favourite />} />

        {/* Admin login — public, no auth required */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin panel — all child routes protected */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/*" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-shows" element={<AddShows />} />
            <Route path="list-shows" element={<ListShows />} />
            <Route path="list-bookings" element={<ListBookings />} />
          </Route>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </AdminAuthProvider>
  )
}

export default App