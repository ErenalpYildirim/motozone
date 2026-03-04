import React, { useState } from 'react';
import { X, MapPin, Coffee, Navigation, Users } from 'lucide-react';
import { Location } from '../../types';

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckIn: (status: string, message: string) => void;
    currentLocation: Location;
}

export function CheckInModal({ isOpen, onClose, onCheckIn }: CheckInModalProps) {
    const [status, setStatus] = useState('riding');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleCheckIn = () => {
        onCheckIn(status, message);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
            <div className="bg-moto-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-300">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MapPin className="text-red-500" />
                        Check In
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} className="text-moto-muted" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-moto-muted mb-3 block">What are you doing?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <StatusOption
                                icon={<Navigation size={20} />}
                                label="Riding"
                                selected={status === 'riding'}
                                onClick={() => setStatus('riding')}
                            />
                            <StatusOption
                                icon={<Coffee size={20} />}
                                label="Chilling"
                                selected={status === 'chilling'}
                                onClick={() => setStatus('chilling')}
                            />
                            <StatusOption
                                icon={<Users size={20} />}
                                label="Meetup"
                                selected={status === 'meetup'}
                                onClick={() => setStatus('meetup')}
                            />
                            <StatusOption
                                icon={<MapPin size={20} />}
                                label="At A Spot"
                                selected={status === 'spot'}
                                onClick={() => setStatus('spot')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-moto-muted mb-2 block">Short Message (Optional)</label>
                        <input
                            type="text"
                            placeholder="Anyone nearby?"
                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleCheckIn}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Check In Now
                    </button>
                </div>

            </div>
        </div>
    );
}

function StatusOption({ icon, label, selected, onClick }: { icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selected
                ? 'bg-red-500/10 border-red-500 text-white'
                : 'bg-white/5 border-white/5 text-moto-muted hover:bg-white/10'
                }`}
        >
            {selected ? <span className="text-red-500">{icon}</span> : icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}
