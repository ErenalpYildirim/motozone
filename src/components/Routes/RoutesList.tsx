import { useState } from 'react';
import { Navigation, ThumbsUp, Star } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface Route {
    id: string;
    title: string;
    author: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    distance: string;
    rating: number; // 0-5
    votes: number;
    description: string;
    image: string;
}

const INITIAL_ROUTES: Route[] = [
    {
        id: '1',
        title: 'Coastal Paradise Run',
        author: 'Can S.',
        difficulty: 'Medium',
        distance: '120 km',
        rating: 4.8,
        votes: 42,
        description: 'Beautiful scenic route along the Black Sea coast. Lots of curves!',
        image: 'https://images.unsplash.com/photo-1476842634003-7dcca8f832de?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '2',
        title: 'City Night Cruiser',
        author: 'MotoGuru',
        difficulty: 'Easy',
        distance: '45 km',
        rating: 4.2,
        votes: 128,
        description: 'Relaxed night ride through the illuminated city bridges.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
    }
];

export function RoutesList() {
    const { showToast } = useToast();
    const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);

    const handleRate = (routeId: string, rating: number) => {
        setRoutes(prev => prev.map(r => {
            if (r.id === routeId) {
                // Mock calculation for new average
                const newVotes = r.votes + 1;
                const newRating = ((r.rating * r.votes) + rating) / newVotes;
                return { ...r, votes: newVotes, rating: parseFloat(newRating.toFixed(1)) };
            }
            return r;
        }));
        showToast('Thanks for rating!', 'success');
    };

    return (
        <div className="h-full w-full bg-moto-dark p-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                            Top Routes
                        </h2>
                        <p className="text-moto-muted">Discover and rate the best riding paths.</p>
                    </div>
                    <button
                        onClick={() => showToast('Route Creator opening...', 'info')}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Navigation size={18} />
                        Share Route
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {routes.map((route) => (
                        <div key={route.id} className="bg-moto-card rounded-xl border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-xl hover:border-white/20 transition-all">
                            {/* Image Section */}
                            <div className="md:w-1/3 h-48 md:h-auto relative group">
                                <img
                                    src={route.image}
                                    alt={route.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
                                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${route.difficulty === 'Hard' ? 'bg-red-600' :
                                    route.difficulty === 'Medium' ? 'bg-orange-500' : 'bg-green-600'
                                    }`}>
                                    {route.difficulty}
                                </span>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold">{route.title}</h3>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star size={16} fill="currentColor" />
                                            <span className="font-bold">{route.rating}</span>
                                            <span className="text-moto-muted text-sm ml-1">({route.votes})</span>
                                        </div>
                                    </div>

                                    <p className="text-moto-muted mb-4">{route.description}</p>

                                    <div className="flex items-center gap-4 text-sm text-moto-muted mb-6">
                                        <div className="flex items-center gap-1">
                                            <Navigation size={14} />
                                            {route.distance}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ThumbsUp size={14} />
                                            By {route.author}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-moto-muted">Rate:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleRate(route.id, star)}
                                                className="text-white/20 hover:text-yellow-500 transition-colors"
                                            >
                                                <Star size={18} />
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => showToast(`Starting navigation for ${route.title}`, 'success')}
                                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                                    >
                                        Ride Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
