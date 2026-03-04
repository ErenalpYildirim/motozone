export interface Location {
    lat: number;
    lng: number;
}

export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedDate?: string;
}

export interface Bike {
    id: string;
    model: string;
    year: number;
    image: string;
    isPrimary: boolean;
}

export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
    location?: Location;
    lastSeen?: Date;
    motorcycle?: string; // Legacy field, keeping for compatibility
    status?: string;
    message?: string;

    // Gamification & Profile
    level?: number;
    xp?: number;
    maxXp?: number;
    badges?: Badge[];
    garage?: Bike[];
    stats?: {
        totalRides: number;
        totalDistance: string;
        eventsAttended: number;
    };
}

export interface Venue {
    id: string;
    name: string;
    location: Location;
    type: 'cafe' | 'gas' | 'mechanic' | 'meetup';
    rating: number;
    isMotoFriendly: boolean; // "Moto-Stop" verification
    amenities: string[]; // e.g., ["Safe Parking", "Helmet Storage"]
}

export interface Event {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    location: string;
    date: string;
    time: string;
    image_url?: string;
    type: 'ride' | 'meetup';
    created_at?: string;
}

export interface CheckIn {
    id: string;
    user_id: string;
    lat: number;
    lng: number;
    status_message?: string;
    activity_type: string;
    created_at: string;
}
