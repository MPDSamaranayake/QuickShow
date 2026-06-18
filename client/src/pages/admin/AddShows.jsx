import React, { useEffect, useRef, useState } from 'react';
import Title from '../../components/admin/Title';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddShows = () => {
    const { adminRequest } = useApi();
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [duration, setDuration] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [status, setStatus] = useState('now_showing');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    const handleUploadChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file.');
            event.target.value = '';
            return;
        }

        setImageFile(file);
        const objectUrl = URL.createObjectURL(file);
        setImagePreview((currentPreview) => {
            if (currentPreview) {
                URL.revokeObjectURL(currentPreview);
            }
            return objectUrl;
        });
    };

    const clearUploadPreview = () => {
        setImagePreview((currentPreview) => {
            if (currentPreview) {
                URL.revokeObjectURL(currentPreview);
            }
            return '';
        });
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) return toast.error("Please enter a movie title.");
        if (!description.trim()) return toast.error("Please enter a description.");
        if (!genre.trim()) return toast.error("Please enter a genre.");
        if (!duration || Number(duration) <= 0) return toast.error("Please enter a valid duration.");
        if (!releaseDate) return toast.error("Please select a release date.");
        if (!imageFile) return toast.error("Please upload a poster image.");

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('genre', genre.trim());
            formData.append('duration', Number(duration));
            formData.append('releaseDate', releaseDate);
            formData.append('status', status);
            formData.append('image', imageFile);

            await adminRequest('/api/movies', {
                method: 'POST',
                body: formData
            });

            toast.success("Movie added successfully!");
            setTitle('');
            setDescription('');
            setGenre('');
            setDuration('');
            setReleaseDate('');
            setStatus('now_showing');
            setImageFile(null);
            setImagePreview('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Redirect to Dashboard to view the now showing movies
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.message || "Failed to add movie.");
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <>
            <Title text1="Add" text2="Movie" />
            <form onSubmit={handleSubmit} className='mt-8 max-w-4xl space-y-6'>
                <div className='grid gap-6 md:grid-cols-2'>
                    <div>
                        <label className='block text-sm font-medium mb-2 text-gray-300'>Movie Title</label>
                        <input
                            type='text'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='Enter movie title'
                            className='w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white outline-none focus:border-primary transition-colors'
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-2 text-gray-300'>Genre</label>
                        <input
                            type='text'
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder='e.g. Action, Comedy, Drama'
                            className='w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white outline-none focus:border-primary transition-colors'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-2 text-gray-300'>Description</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Enter movie description / overview'
                        className='w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white outline-none focus:border-primary transition-colors resize-none'
                        required
                    />
                </div>

                <div className='grid gap-6 md:grid-cols-3'>
                    <div>
                        <label className='block text-sm font-medium mb-2 text-gray-300'>Duration (Minutes)</label>
                        <input
                            type='number'
                            min={1}
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder='e.g. 120'
                            className='w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white outline-none focus:border-primary transition-colors'
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-2 text-gray-300'>Release Date</label>
                        <input
                            type='date'
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            className='w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white outline-none focus:border-primary transition-colors [color-scheme:dark]'
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-2 text-gray-300'>Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className='w-full rounded-md border border-gray-600 bg-gray-900 px-4 py-2 text-white outline-none focus:border-primary transition-colors'
                        >
                            <option value='now_showing'>Now Showing</option>
                            <option value='coming_soon'>Coming Soon</option>
                        </select>
                    </div>
                </div>

                {/* Upload Image Section */}
                <div className='rounded-2xl border border-dashed border-gray-600 bg-white/5 p-5 md:p-6'>
                    <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
                        <div className='flex items-start gap-4'>
                            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary'>
                                <UploadCloud className='h-7 w-7' />
                            </div>
                            <div>
                                <h2 className='text-lg font-medium text-white'>Upload Movie Poster</h2>
                                <p className='mt-1 text-sm text-gray-400'>
                                    Select a high-quality poster image for the movie card. JPG, PNG, or WebP is recommended.
                                </p>
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 cursor-pointer'
                            >
                                <UploadCloud className='h-4 w-4' />
                                Choose Image
                            </button>
                            {imagePreview && (
                                <button
                                    type='button'
                                    onClick={clearUploadPreview}
                                    className='inline-flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-400 cursor-pointer'
                                >
                                    <X className='h-4 w-4' />
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={handleUploadChange}
                    />

                    <div className='mt-5 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]'>
                        <div className='flex h-48 items-center justify-center overflow-hidden rounded-xl border border-gray-700 bg-black/30'>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt='Poster preview'
                                    className='h-full w-full object-cover'
                                />
                            ) : (
                                <div className='text-center text-gray-500'>
                                    <ImageIcon className='mx-auto h-10 w-10 text-gray-500' />
                                    <p className='mt-2 text-sm'>No image selected</p>
                                </div>
                            )}
                        </div>

                        <div className='flex flex-col justify-center rounded-xl border border-gray-700 bg-black/20 p-4 text-sm text-gray-300'>
                            <p className='font-medium text-white'>File Requirements</p>
                            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-400'>
                                <li>Aspect ratio: Vertical poster orientation preferred (e.g. 2:3)</li>
                                <li>Maximum file size: 5MB</li>
                                <li>The image will be securely saved to the database.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <button
                    type='submit'
                    className='bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-all font-medium cursor-pointer shadow-lg shadow-primary/20'
                >
                    Add Movie
                </button>
            </form>
        </>
    );
};

export default AddShows;
