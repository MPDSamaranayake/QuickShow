export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    next();
};

export const validateMovie = (req, res, next) => {
    const { title, overview, poster_path, backdrop_path, genres, casts, release_date, original_language, runtime } = req.body;
    if (!title || !overview || !poster_path || !backdrop_path || !genres || !casts || !release_date || !original_language || !runtime) {
        return res.status(400).json({ message: 'All movie fields (title, overview, poster_path, backdrop_path, genres, casts, release_date, original_language, runtime) are required.' });
    }
    next();
};

export const validateShow = (req, res, next) => {
    const { movie, showDateTime, showPrice } = req.body;
    if (!movie || !showDateTime || showPrice === undefined) {
        return res.status(400).json({ message: 'Movie ID, showDateTime, and showPrice are required.' });
    }
    if (isNaN(new Date(showDateTime).getTime())) {
        return res.status(400).json({ message: 'Invalid date/time format for showDateTime.' });
    }
    if (Number(showPrice) < 0) {
        return res.status(400).json({ message: 'Show price cannot be negative.' });
    }
    next();
};

export const validateBooking = (req, res, next) => {
    const { showId, seats } = req.body;
    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ message: 'Show ID and an array of seat numbers are required.' });
    }
    if (seats.length > 5) {
        return res.status(400).json({ message: 'You can only book a maximum of 5 seats at a time.' });
    }
    next();
};
