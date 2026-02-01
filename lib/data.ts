import { Neighbor } from "@/types/neighbor";
import { Event } from "@/types/event";
import { HoaDocument } from "@/types/hoa";
import { CommunityResource } from "@/types/resource";
import { MarketplaceItem } from "@/types/marketplace";

export const MOCK_NEIGHBORS: Neighbor[] = [];

export const MOCK_EVENTS: Event[] = [];

export const MOCK_DOCUMENTS: HoaDocument[] = [
    {
        id: "d1",
        name: "HOA Bylaws & Covenants",
        category: "Rules",
        uploadDate: "2023-01-01",
        size: "2.4 MB",
        url: "#",
        uploaderName: "Admin"
    },
    {
        id: "d2",
        name: "Architectural Review Form",
        category: "Forms",
        uploadDate: "2023-03-15",
        size: "156 KB",
        url: "#",
        uploaderName: "Sarah Jenkins"
    },
    {
        id: "d3",
        name: "2023 Annual Financial Report",
        category: "Financials",
        uploadDate: "2024-01-10",
        size: "1.1 MB",
        url: "#",
        uploaderName: "Admin"
    },
    {
        id: "d4",
        name: "Jan 2024 Meeting Minutes",
        category: "Meeting Minutes",
        uploadDate: "2024-01-15",
        size: "450 KB",
        url: "#",
        uploaderName: "Sarah Jenkins"
    },
    {
        id: "d5",
        name: "Pool Rules & Regulations",
        category: "Rules",
        uploadDate: "2023-05-20",
        size: "320 KB",
        url: "#",
        uploaderName: "Admin"
    }
];

export const MOCK_RESOURCES: CommunityResource[] = [
    {
        id: "r1",
        name: "Community Center Main Hall",
        type: "Facility",
        capacity: 100,
        description: "Large hall suitable for parties and meetings. Includes tables, chairs, and kitchenette.",
        isReservable: true,
        nextAvailable: "Tomorrow"
    },
    {
        id: "r2",
        name: "Park Pavilion",
        type: "Facility",
        capacity: 40,
        description: "Outdoor covered pavilion with picnic tables and charcoal grills.",
        isReservable: true,
        nextAvailable: "Today"
    },
    {
        id: "r3",
        name: "Ride-on Lawnmower",
        type: "Tool",
        description: "Shared community lawnmower. Fuel not included.",
        isReservable: true,
        nextAvailable: "Today"
    },
    {
        id: "r4",
        name: "Pressure Washer (Industrial)",
        type: "Tool",
        description: "High-power gas pressure washer. Safety goggles required.",
        isReservable: true,
        nextAvailable: "Feb 15"
    }
];

const today = new Date();
const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_MARKETPLACE: MarketplaceItem[] = [
    {
        id: "m1",
        title: "Kids Bike (Age 5-8)",
        description: "Red specialized bike. Great condition, just outgrown. Includes training wheels.",
        price: 40,
        isFree: false,
        isNegotiable: true,
        images: [],
        status: "Active",
        postedDate: tenDaysAgo,
        expiresAt: thirtyDaysFromNow,
        sellerId: "2",
        sellerName: "Mike Chen"
    },
    {
        id: "m2",
        title: "Moving Boxes",
        description: "Bundle of 20 medium moving boxes. Used once.",
        price: 0,
        isFree: true,
        isNegotiable: false,
        images: [],
        status: "Active",
        postedDate: new Date().toISOString(),
        expiresAt: thirtyDaysFromNow,
        sellerId: "3",
        sellerName: "Emily Rodriguez"
    },
    {
        id: "m3",
        title: "Vintage Coffee Table",
        description: "Solid oak coffee table. Needs a bit of refinishing on top.",
        price: 25,
        isFree: false,
        isNegotiable: false,
        images: [],
        status: "Sold",
        postedDate: "2024-01-10",
        expiresAt: "2024-02-10",
        sellerId: "1",
        sellerName: "Sarah Jenkins"
    }
];
