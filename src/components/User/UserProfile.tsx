import { useEffect, useState } from 'react';
import { Award, Bike, Zap, MapPin, Gauge, LogOut, Trash2, Clock, MapPin as MapPinIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User, CheckIn } from '../../types';
import { useToast } from '../ui/Toast';

export function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchProfileData = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Fetch Profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileData) {
            const rawStatus = profileData.status || 'Ready to Ride';
            const [statusPart, messagePart] = rawStatus.split('::');

            setUser({
                id: profileData.id,
                name: profileData.username || 'Rider',
                level: profileData.level || 1,
                xp: profileData.xp || 0,
                maxXp: (profileData.level || 1) * 1000,
                status: statusPart,
                message: messagePart,
                location: { lat: 0, lng: 0 },
                badges: [
                    { id: '1', name: 'Iron Butt', icon: '🛡️', description: 'Rode 500km in one day', earnedDate: '2024-05-12' },
                    { id: '2', name: 'Early Bird', icon: '🌅', description: 'Joined 5 morning rides', earnedDate: '2024-06-01' },
                ],
                garage: [
                    { id: '1', model: 'Yamaha MT-07', year: 2023, isPrimary: true, image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80' }
                ],
                stats: {
                    totalRides: 42,
                    totalDistance: '8,540 km',
                    eventsAttended: 15
                }
            });
        }

        // Fetch Check-ins
        const { data: checkInData } = await supabase
            .from('checkins')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (checkInData) setCheckIns(checkInData);
        setLoading(false);
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout error:', error);
        window.location.href = '/';
    };

    const handleDeleteCheckIn = async (id: string) => {
        if (!confirm('Delete this check-in?')) return;

        const { error } = await supabase
            .from('checkins')
            .delete()
            .eq('id', id);

        if (error) {
            showToast('Failed to delete check-in', 'error');
        } else {
            showToast('Check-in deleted', 'success');
            setCheckIns(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleClearStatus = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ status: 'Offline' })
            .eq('id', user.id);

        if (error) {
            showToast('Failed to clear status', 'error');
        } else {
            showToast('Status cleared', 'success');
            fetchProfileData();
        }
    };

    if (loading) return <div className="p-8 text-center text-moto-muted">Loading profile...</div>;
    if (!user) return <div className="p-8 text-center text-moto-muted">Please log in to view profile.</div>;

    const progressPercentage = ((user.xp || 0) / (user.maxXp || 1)) * 100;

    return (
        <div className="h-full w-full bg-moto-dark p-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">

                {/* Header Profile Card */}
                <div className="bg-moto-card rounded-2xl border border-white/10 p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-red-600 to-orange-600 opacity-20" />

                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button
                            onClick={handleClearStatus}
                            className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition-all backdrop-blur-sm border border-white/5 text-xs font-bold px-3"
                        >
                            Clear Status
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition-all backdrop-blur-sm border border-white/5"
                            title="Log Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                    <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
                        <div className="w-24 h-24 rounded-full bg-neutral-800 border-4 border-red-500 flex items-center justify-center text-3xl shadow-xl">
                            🏍️
                        </div>
                        <div className="ml-4 flex-1 text-center md:text-left">
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <div className="text-white/60 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                                <span className={`w-2 h-2 rounded-full ${user.status === 'Offline' ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`} />
                                {user.status}
                            </div>
                            {user.message && (
                                <div className="text-white/80 text-xs mt-0.5 italic">"{user.message}"</div>
                            )}
                        </div>

                        <div className="text-center">
                            <div className="text-xs text-moto-muted uppercase tracking-wider mb-1">Level</div>
                            <div className="text-4xl font-black text-white">{user.level}</div>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between text-xs font-bold uppercase text-moto-muted mb-2">
                            <span>{user.xp} XP</span>
                            <span>{user.maxXp} XP</span>
                        </div>
                        <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard icon={<Gauge size={20} />} value={user.stats?.totalDistance || '0 km'} label="Total Distance" />
                    <StatCard icon={<MapPinIcon size={20} />} value={user.stats?.totalRides.toString() || '0'} label="Rides Completed" />
                    <StatCard icon={<Zap size={20} />} value={user.stats?.eventsAttended.toString() || '0'} label="Events Attended" />
                </div>

                {/* Check-in History */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Clock size={24} className="text-orange-500" />
                        Check-in History
                    </h3>
                    <div className="space-y-3">
                        {checkIns.length > 0 ? (
                            checkIns.map(ci => (
                                <div key={ci.id} className="bg-moto-card rounded-xl border border-white/10 p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/5 p-2 rounded-lg">
                                            <MapPin size={20} className="text-red-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white">
                                                {ci.status_message}
                                            </div>
                                            <div className="text-xs text-moto-muted flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(ci.created_at).toLocaleDateString()} at {new Date(ci.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCheckIn(ci.id)}
                                        className="p-2 text-moto-muted hover:text-red-500 opacity-60 hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-moto-muted bg-white/5 rounded-xl border border-dashed border-white/10">
                                No check-ins yet. Head to the map and check in!
                            </div>
                        )}
                    </div>
                </div>

                {/* Garage */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Bike size={24} className="text-red-500" />
                        My Garage
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.garage?.map(bike => (
                            <div key={bike.id} className="bg-moto-card rounded-xl border border-white/10 overflow-hidden flex shadow-lg">
                                <img src={bike.image} alt={bike.model} className="w-32 h-32 object-cover" />
                                <div className="p-4 flex flex-col justify-center">
                                    <h4 className="font-bold text-lg">{bike.model}</h4>
                                    <p className="text-moto-muted text-sm">{bike.year}</p>
                                    {bike.isPrimary && (
                                        <span className="inline-block mt-2 text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full border border-red-500/20">
                                            Primary Ride
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badges / Achievements */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Award size={24} className="text-yellow-500" />
                        Earned Badges
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {user.badges?.map(badge => (
                            <div key={badge.id} className="bg-moto-card p-4 rounded-xl border border-white/10 flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors group">
                                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{badge.icon}</div>
                                <div className="font-bold text-sm">{badge.name}</div>
                                <div className="text-xs text-moto-muted">{badge.description}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="bg-moto-card p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center gap-1 shadow-lg">
            <div className="text-red-500 mb-1">{icon}</div>
            <div className="font-black text-xl md:text-2xl">{value}</div>
            <div className="text-xs text-moto-muted">{label}</div>
        </div>
    )
}
