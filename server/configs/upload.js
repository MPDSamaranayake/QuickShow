import multer from 'multer';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = join(__dirname, '..', 'uploads', 'shows');

mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadsDir);
    },
    filename: (_req, file, callback) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = file.originalname.split('.').pop();
        callback(null, `${uniqueName}.${extension}`);
    }
});

const imageFileFilter = (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed.'));
    }

    callback(null, true);
};

export const uploadShowArtwork = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const movieUploadsDir = join(__dirname, '..', 'uploads', 'movies');
mkdirSync(movieUploadsDir, { recursive: true });

const movieStorage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, movieUploadsDir);
    },
    filename: (_req, file, callback) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = file.originalname.split('.').pop();
        callback(null, `${uniqueName}.${extension}`);
    }
});

export const uploadMoviePoster = multer({
    storage: movieStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});