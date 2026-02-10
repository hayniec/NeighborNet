export interface Equipment {
    id: string;
    name: string;
    isAvailable: boolean;
    dueDate?: string;
    borrowerName?: string;
}

export interface Neighbor {
    id: string;
    name: string;
    role: 'Resident' | 'Board Member' | 'Admin' | 'Event Manager';
    address: string;
    avatar: string; // initials or image url
    phone?: string; // Optional for privacy
    skills: string[];
    equipment: Equipment[];
    joinedDate: string;
    isOnline?: boolean;
}
