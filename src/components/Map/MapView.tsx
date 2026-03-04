import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Location, User } from '../../types';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Fix for default marker icons in React Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
    currentLocation: Location;
    nearbyUsers: User[];
    userStatus?: { status: string; message: string };
    targetLocation?: Location;
}

// Smart Controller that handles following the user
function MapController({ center, targetLocation, isTracking, onUserInteract }: { center: Location, targetLocation?: Location, isTracking: boolean, onUserInteract: () => void }) {
    const map = useMap();

    // Listen for user interactions to disable tracking
    useMapEvents({
        dragstart: () => onUserInteract(),
        zoomstart: () => onUserInteract(),
    });

    useEffect(() => {
        // If targetLocation changes, fly to it
        if (targetLocation) {
            onUserInteract(); // Stop tracking current user
            map.flyTo([targetLocation.lat, targetLocation.lng], 15, {
                animate: true,
                duration: 1.5
            });
        }
    }, [targetLocation, map]);

    useEffect(() => {
        // If tracking is enabled, fly to the new center
        if (isTracking) {
            map.flyTo([center.lat, center.lng], map.getZoom(), {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, isTracking, map]);

    return null;
}

export function MapView({ currentLocation, nearbyUsers, userStatus, targetLocation }: MapViewProps) {
    const [isTracking, setIsTracking] = useState(true);

    // Reset tracking if targetLocation changes, handled in MapController but state sync is good practice? 
    // Actually MapController calls onUserInteract which sets isTracking to false.

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
            <MapContainer
                center={[currentLocation.lat, currentLocation.lng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                className="bg-moto-card"
            >
                <MapController
                    center={currentLocation}
                    targetLocation={targetLocation}
                    isTracking={isTracking}
                    onUserInteract={() => setIsTracking(false)}
                />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <Marker position={[currentLocation.lat, currentLocation.lng]}>
                    <Popup>
                        <div className="text-gray-900">
                            <strong>You are here 🏍️</strong>
                            {userStatus && (
                                <div className="mt-1 border-t border-gray-200 pt-1">
                                    <div className="text-sm font-medium text-red-600 capitalize">{userStatus.status}</div>
                                    {userStatus.message && <div className="text-xs text-gray-500 italic">"{userStatus.message}"</div>}
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>

                {nearbyUsers.map(user => (
                    user.location && (
                        <Marker key={user.id} position={[user.location.lat, user.location.lng]}>
                            <Popup>
                                <div className="text-gray-900">
                                    <strong>{user.name}</strong><br />
                                    {user.status && <span className="text-xs text-gray-500">{user.status}</span>}
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {/* Recenter Button - Only visible when NOT tracking */}
            {!isTracking && (
                <button
                    onClick={() => setIsTracking(true)}
                    className="absolute bottom-24 right-4 z-[400] bg-moto-card/90 backdrop-blur text-white p-3 rounded-xl border border-white/20 shadow-lg hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-200"
                >
                    <Navigation size={20} className="text-red-500" />
                    <span className="text-xs font-bold">Recenter</span>
                </button>
            )}
        </div>
    );
}
