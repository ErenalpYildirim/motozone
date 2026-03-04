import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Event } from '../../types';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    event?: Event; // If provided, we are editing
}

export function EventModal({ isOpen, onClose, onSuccess, event }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [type, setType] = useState<'ride' | 'meetup'>('ride');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description || '');
            setLocation(event.location);
            setDate(event.date);
            setTime(event.time);
            setImageUrl(event.image_url || '');
            setType(event.type);
        } else {
            setTitle('');
            setDescription('');
            setLocation('');
            setDate('');
            setTime('');
            setImageUrl('');
            setType('ride');
        }
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error('Not authenticated');

            const eventData = {
                user_id: session.user.id,
                title,
                description,
                location,
                date,
                time,
                image_url: imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
                type
            };

            if (event) {
                // Update
                const { error } = await supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', event.id);
                if (error) throw error;
                showToast('Event updated successfully!', 'success');
            } else {
                // Create
                const { error } = await supabase
                    .from('events')
                    .insert(eventData);
                if (error) throw error;
                showToast('Event created successfully!', 'success');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-moto-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-red-500" />
                        {event ? 'Edit Event' : 'Create Event'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} className="text-moto-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-moto-muted mb-1 block">Title</label>
                        <input
                            required
                            type="text"
                            placeholder="Sunday Morning Ride..."
                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-moto-muted mb-1 block">Type</label>
                            <select
                                className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                value={type}
                                onChange={(e) => setType(e.target.value as 'ride' | 'meetup')}
                            >
                                <option value="ride">Ride</option>
                                <option value="meetup">Meetup</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-moto-muted mb-1 block">Location</label>
                            <input
                                required
                                type="text"
                                placeholder="Shell Station, Atasehir"
                                className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-moto-muted mb-1 block">Date</label>
                            <input
                                required
                                type="text"
                                placeholder="This Sunday"
                                className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-moto-muted mb-1 block">Time</label>
                            <input
                                required
                                type="text"
                                placeholder="07:30 AM"
                                className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-moto-muted mb-1 block">Image URL (Optional)</label>
                        <input
                            type="text"
                            placeholder="https://..."
                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-moto-muted mb-1 block">Description</label>
                        <textarea
                            rows={3}
                            placeholder="What's the plan?"
                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
}
