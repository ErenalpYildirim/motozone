import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { EventModal } from './EventModal';
import { useToast } from '../ui/Toast';

export function EventsList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchEvents = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUserId(session?.user?.id || null);

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            showToast('Error fetching events', 'error');
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            showToast('Error deleting event', 'error');
        } else {
            showToast('Event deleted', 'success');
            fetchEvents();
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingEvent(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="h-full w-full bg-moto-dark p-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                            Upcoming Events
                        </h2>
                        <p className="text-moto-muted">Find your next ride or meetup.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
                    >
                        <Plus size={20} />
                        Add Event
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin text-4xl">🏍️</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event.id} className="bg-moto-card rounded-xl border border-white/10 overflow-hidden hover:border-red-500/50 transition-all group hover:transform hover:scale-[1.02] shadow-xl relative">
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                    <img
                                        src={event.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <span className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-bold uppercase ${event.type === 'ride' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                        {event.type}
                                    </span>

                                    {/* Edit/Delete Actions */}
                                    {currentUserId === event.user_id && (
                                        <div className="absolute top-4 left-4 z-30 flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                                                className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                                                className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-4 z-20">
                                        <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                                            <Calendar size={14} />
                                            {event.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                            <Clock size={14} />
                                            {event.time}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-xl font-bold mb-3">{event.title}</h3>

                                    <div className="flex items-center gap-2 text-moto-muted text-sm mb-4">
                                        <MapPin size={16} className="text-red-500" />
                                        {event.location}
                                    </div>

                                    {event.description && (
                                        <p className="text-sm text-moto-muted mb-4 line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-sm text-moto-muted">
                                            <Users size={16} />
                                            <span>0 Going</span>
                                        </div>
                                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                                            Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && events.length === 0 && (
                    <div className="text-center p-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Calendar size={48} className="mx-auto text-moto-muted mb-4" />
                        <h3 className="text-xl font-bold mb-2">No events found</h3>
                        <p className="text-moto-muted mb-6">Be the first to create a ride or meetup!</p>
                        <button
                            onClick={handleCreate}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Create Event
                        </button>
                    </div>
                )}
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEvents}
                event={editingEvent}
            />
        </div>
    );
}
