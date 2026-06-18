import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import useApi from '../../hooks/useApi';

const ListBookings = () => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$'
    const { adminRequest } = useApi();

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getALLBookings = async () => {
        try {
            setIsLoading(true);
            const data = await adminRequest('/api/admin/bookings');
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch admin bookings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getALLBookings();
    }, []);


	return !isLoading ? (
		<>
        <Title text1="List" text2="Bookings" />
        <div className='max-w-4xl mt-6 overflow-x-auto'>
            <table className='w-full border-collapse rounded-md overflow-hidden'>
                <thead>
                    <tr className='bg-primary/20 text-left text-white'>
                        <th className='p-2 font-medium pl-5'>User Name</th>
                        <th className='p-2 font-medium'>Movie Name</th>
                        <th className='p-2 font-medium'>Show Time</th>
                        <th className='p-2 font-medium'>Seats</th>
                        <th className='p-2 font-medium'>Amount</th>
                        </tr>
                        </thead>
                        <tbody className='text-sm font-light'>
                            {bookings.map((booking, index) => (
                                <tr key={index} className='border-b border-primary/20 bg-primary/5 even:bg-primary/10'>
                                    <td className='p-2 min-w-45 pl-5'>{booking.user.name}</td>
                                    <td className='p-2 '>{booking.show.movie.title}</td>
                                    <td className='p-2 '>{dateFormat(booking.show.showDateTime)}</td>
                                    <td className='p-2 '>{booking.bookedSeats.join(', ')}</td>
                                    <td className='p-2 '>{currency}{booking.amount}</td>
                                </tr>
                            ))}
                        </tbody>
            </table>

        </div>


        </>
	) : <Loading />
}

export default ListBookings
