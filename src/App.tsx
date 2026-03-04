import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Map as MapIcon, Users, Calendar, MapPin, Navigation, User as UserIcon, ChevronLeft } from 'lucide-react';

import { MapView } from './components/Map/MapView';
import { useGeolocation } from './services/location';
import { CheckInModal } from './components/CheckIn/CheckInModal';
import { NearbyRiders } from './components/User/NearbyRiders';
import { ToastProvider, useToast } from './components/ui/Toast';
import { EventsList } from './components/Events/EventsList';
import { RoutesList } from './components/Routes/RoutesList';
import { UserProfile } from './components/User/UserProfile';
import { AuthScreen } from './components/Auth/AuthScreen';
import { supabase } from './lib/supabase';

type ViewState = 'map' | 'events' | 'routes' | 'profile';

function AppContent() {
    const { location, error, nearbyUsers } = useGeolocation();
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [showRiders, setShowRiders] = useState(true);
    const [currentView, setCurrentView] = useState<ViewState>('map');
    const [userStatus, setUserStatus] = useState<{ status: string; message: string } | undefined>(undefined);
    const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number } | undefined>(undefined);
    const { showToast } = useToast();

    const handleCenterMap = (location: { lat: number, lng: number }) => {
        setMapTarget(location);
        if (currentView !== 'map') {
            setCurrentView('map');
            setTimeout(() => showToast(`Centering on rider...`, 'info'), 100);
        } else {
            showToast(`Centering on rider...`, 'info');
        }
    };

    const handleCheckIn = async (status: string, message: string) => {
        console.log('Checked in:', status, message);
        setUserStatus({ status, message });

        // Save to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const formattedStatus = message ? `${status}::${message}` : status;

            // Update profile for "Current Status"
            await supabase
                .from('profiles')
                .update({ status: formattedStatus })
                .eq('id', session.user.id);

            // Insert into history
            await supabase
                .from('checkins')
                .insert({
                    user_id: session.user.id,
                    lat: location.lat,
                    lng: location.lng,
                    status_message: message || status,
                    activity_type: status
                });
        }

        showToast(`Checked in as ${status}!`, 'success');
    };

    return (
        <div className="h-screen w-full bg-moto-dark text-white font-sans flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar / Mobile Nav */}
            <nav className="z-10 bg-moto-card border-t md:border-r border-white/10 md:w-20 md:h-full h-16 w-full flex md:flex-col justify-around md:justify-start items-center p-2 order-2 md:order-1 shrink-0">
                <div className="hidden md:flex items-center justify-center h-16 mb-6">
                    <span className="text-2xl">🏍️</span>
                </div>
                <NavButton
                    icon={<MapIcon size={24} />}
                    active={currentView === 'map'}
                    onClick={() => setCurrentView('map')}
                />
                <NavButton
                    icon={<Users size={24} />}
                    active={showRiders}
                    onClick={() => {
                        if (currentView !== 'map') setCurrentView('map');
                        setShowRiders(!showRiders);
                    }}
                />
                <NavButton
                    icon={<Calendar size={24} />}
                    active={currentView === 'events'}
                    onClick={() => setCurrentView('events')}
                />
                <NavButton
                    icon={<Navigation size={24} />}
                    active={currentView === 'routes'}
                    onClick={() => setCurrentView('routes')}
                />
                <div className="mt-auto hidden md:flex md:flex-col md:items-center md:gap-4 md:mb-4">
                    <div className="w-full h-px bg-white/10 my-2"></div>
                    <NavButton
                        icon={<UserIcon size={24} />}
                        active={currentView === 'profile'}
                        onClick={() => setCurrentView('profile')}
                    />
                </div>
                {/* Mobile Profile Button */}
                <div className="md:hidden">
                    <NavButton
                        icon={<UserIcon size={24} />}
                        active={currentView === 'profile'}
                        onClick={() => setCurrentView('profile')}
                    />
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 relative h-full order-1 md:order-2 flex flex-col min-h-0">
                {/* Header/Top Bar for Sub-views */}
                {currentView !== 'map' && (
                    <header className="h-16 bg-moto-card/95 backdrop-blur-md border-b border-white/10 flex items-center px-4 z-50 shrink-0">
                        <button
                            onClick={() => setCurrentView('map')}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                            title="Back to Map"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="ml-2 text-lg font-bold tracking-tight capitalize">
                            {currentView}
                        </h2>
                    </header>
                )}

                <div className="flex-1 min-h-0 relative">
                    {/* Header Overlay - Only show on Map */}
                    {currentView === 'map' && (
                        <div className="absolute top-4 left-4 z-[400] bg-moto-card/90 backdrop-blur p-3 rounded-xl border border-white/10 shadow-lg max-w-[180px]">
                            <h1 className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">MotoZone</h1>
                            <p className="text-[10px] text-moto-muted mt-0.5 leading-tight">
                                {error ? `Error: ${error}` : (
                                    <>
                                        Loc: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                    </>
                                )}
                            </p>
                        </div>
                    )}

                    <div className="w-full h-full">
                        {currentView === 'map' && (
                            <MapView currentLocation={location} nearbyUsers={nearbyUsers} userStatus={userStatus} targetLocation={mapTarget} />
                        )}
                        {currentView === 'events' && (
                            <EventsList />
                        )}
                        {currentView === 'routes' && (
                            <RoutesList />
                        )}
                        {currentView === 'profile' && (
                            <UserProfile />
                        )}
                    </div>

                    {currentView === 'map' && showRiders && (
                        <NearbyRiders
                            users={nearbyUsers}
                            onCenterMap={handleCenterMap}
                        />
                    )}

                    {/* Check-in FAB - Only show on Map */}
                    {currentView === 'map' && (
                        <button
                            onClick={() => setIsCheckInOpen(true)}
                            className="absolute bottom-6 right-6 z-[400] bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-xl shadow-red-600/30 transition-transform hover:scale-110 active:scale-95"
                        >
                            <MapPin size={32} />
                        </button>
                    )}
                </div>

                <CheckInModal
                    isOpen={isCheckInOpen}
                    onClose={() => setIsCheckInOpen(false)}
                    onCheckIn={handleCheckIn}
                    currentLocation={location}
                />
            </main>
        </div>
    );
}

function NavButton({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-xl transition-all duration-200 mb-2 ${active ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-moto-muted hover:bg-white/5 hover:text-white'}`}
        >
            {icon}
        </button>
    )
}

function App() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full bg-moto-dark flex items-center justify-center text-white">
                <div className="animate-spin text-4xl">🏍️</div>
            </div>
        );
    }

    return (
        <Router>
            <ToastProvider>
                {!session ? (
                    <AuthScreen onLoginSuccess={() => { }} />
                ) : (
                    <AppContent />
                )}
            </ToastProvider>
        </Router>
    );
}

export default App;
