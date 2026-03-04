import { useState, useEffect, useRef } from 'react';
import { Location, User } from '../types';
import { supabase } from '../lib/supabase';
import { Geolocation } from '@capacitor/geolocation';

// Mock initial location (Istanbul)
const DEFAULT_LOCATION: Location = { lat: 41.0082, lng: 28.9784 };

export const useGeolocation = () => {
    const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
    const [error, setError] = useState<string | null>(null);
    const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const lastUpdateRef = useRef<number>(0);

    // 1. Get Live Position

    useEffect(() => {
        let watchId: string | null = null;

        const startWatching = async () => {
            try {
                // Request permissions first
                const perm = await Geolocation.checkPermissions();
                if (perm.location !== 'granted') {
                    const req = await Geolocation.requestPermissions();
                    if (req.location !== 'granted') {
                        setError('Location permission denied');
                        return;
                    }
                }

                watchId = await Geolocation.watchPosition(
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 },
                    (position, err) => {
                        if (err) {
                            setError(err.message);
                            return;
                        }
                        if (position) {
                            const newLoc = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            setLocation(newLoc);

                            // Throttle updates to DB (every 5 seconds)
                            if (Date.now() - lastUpdateRef.current > 5000 && currentUserId) {
                                updateLocationInDb(newLoc, currentUserId);
                                lastUpdateRef.current = Date.now();
                            }
                        }
                    }
                );
            } catch (e: any) {
                // Fallback for Web/Browser environment if Capacitor plugin fails
                console.warn('Capacitor Geolocation failed, trying web fallback:', e);

                if (navigator.geolocation) {
                    const webWatchId = navigator.geolocation.watchPosition(
                        (position) => {
                            const newLoc = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            setLocation(newLoc);
                            if (Date.now() - lastUpdateRef.current > 5000 && currentUserId) {
                                updateLocationInDb(newLoc, currentUserId);
                                lastUpdateRef.current = Date.now();
                            }
                        },
                        (err) => {
                            setError(`Web Geolocation Error: ${err.message}`);
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
                    );
                    // Store as string to match type, though cleanup handles both logic
                    watchId = webWatchId.toString();
                } else {
                    setError(e.message || 'Error starting location watch');
                }
            }
        };

        startWatching();

        return () => {
            if (watchId) {
                // Check if it looks like a web ID (pure number string from our hack above) or native string
                // Capacitor usually returns string IDs too.
                // Safest to try both or rely on try/catch.
                try {
                    Geolocation.clearWatch({ id: watchId });
                } catch (e) {
                    // If capacitor fails, try clear web watch
                    navigator.geolocation.clearWatch(Number(watchId));
                }
            }
        };
    }, [currentUserId]);

    // 2. Auth & Realtime Setup
    useEffect(() => {
        const setupSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const userId = session.user.id;
                setCurrentUserId(userId);

                // Subscribe to other riders
                const channel = supabase
                    .channel('public:user_locations')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_locations' },
                        () => { fetchNearbyUsers(userId); }
                    )
                    .subscribe();

                // Initial fetch
                fetchNearbyUsers(userId);

                return () => { supabase.removeChannel(channel); };
            }
        };

        setupSession();
    }, []);

    const updateLocationInDb = async (loc: Location, userId: string) => {
        const { error } = await supabase
            .from('user_locations')
            .upsert({
                user_id: userId,
                lat: loc.lat,
                lng: loc.lng,
                updated_at: new Date().toISOString()
            });

        if (error) console.error("Location upload failed:", error);
    };

    const fetchNearbyUsers = async (myId: string) => {
        // Get locations
        const { data: locs } = await supabase
            .from('user_locations')
            .select('user_id, lat, lng');

        if (!locs) return;

        // Get profiles for these users
        const userIds = locs.map(l => l.user_id).filter(id => id !== myId); // Exclude self

        if (userIds.length === 0) {
            setNearbyUsers([]);
            return;
        }

        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        if (profiles) {
            const mappedUsers: User[] = profiles.map(p => {
                const l = locs.find(loc => loc.user_id === p.id);
                // Parse status for message (Format: "Status::Message")
                const rawStatus = p.status || 'Offline';
                const [statusPart, messagePart] = rawStatus.split('::');

                return {
                    id: p.id,
                    name: p.username || 'Unknown Rider',
                    location: l ? { lat: l.lat, lng: l.lng } : { lat: 0, lng: 0 },
                    status: statusPart,
                    message: messagePart || undefined,
                    level: p.level || 1,
                    xp: p.xp || 0,
                    // Mock complex fields for now
                    maxXp: 100 * (p.level || 1),
                    badges: [],
                    garage: [],
                    stats: { totalRides: 0, totalDistance: '0km', eventsAttended: 0 }
                };
            });
            setNearbyUsers(mappedUsers);
        }
    };

    return { location, error, nearbyUsers, currentUserId, lastUpdated: lastUpdateRef.current };
};
