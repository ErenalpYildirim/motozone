import { User } from '../../types';
import { User as UserIcon, Navigation } from 'lucide-react';

interface NearbyRidersProps {
    users: User[];
    onCenterMap: (location: { lat: number, lng: number }) => void;
}

export function NearbyRiders({ users, onCenterMap }: NearbyRidersProps) {
    return (
        <div className="absolute top-20 right-4 z-[400] bg-moto-card/95 backdrop-blur border border-white/10 rounded-xl shadow-xl w-64 overflow-hidden flex flex-col max-h-[50vh]">
            <div className="p-3 border-b border-white/5 bg-white/5">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <UserIcon size={16} className="text-red-500" />
                    Nearby Riders ({users.length})
                </h3>
            </div>

            <div className="overflow-y-auto p-1 space-y-1">
                {users.map(user => (
                    <div key={user.id} className="p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between group">
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">{user.name}</div>
                            <div className="text-[10px] text-moto-muted truncate">
                                {user.message ? (
                                    <span className="text-white/80">"{user.message}"</span>
                                ) : (
                                    user.status
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => user.location && onCenterMap(user.location)}
                            className="p-2 text-moto-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Navigation size={16} />
                        </button>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="p-4 text-center text-moto-muted text-sm">
                        No riders nearby... yet!
                    </div>
                )}
            </div>
        </div>
    );
}
