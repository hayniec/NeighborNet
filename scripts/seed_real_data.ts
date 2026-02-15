
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const COMMUNITY_ID = "2bf6bc8a-899c-4e29-8ee7-f2038c804260";
const MY_MEMBER_ID = "cd48f9df-4096-4f8d-b76c-9a6dca90ceab";

// Mock Data Definitions
const ADDITIONAL_USERS = [
    { name: "Sarah Jenkins", email: "sarah.jenkins@example.com", initial: "SJ" },
    { name: "Mike Chen", email: "mike.chen@example.com", initial: "MC" },
    { name: "Emily Rodriguez", email: "emily.rodriguez@example.com", initial: "ER" }
];

const FORUM_POSTS_DATA = [
    {
        authorEmail: "sarah.jenkins@example.com",
        content: "Has anyone else noticed the streetlights on Maple Drive flickering lately? Just wanted to check before I report it.",
        category: "Safety",
        comments: [
            { authorEmail: "mike.chen@example.com", content: "Yes! The one in front of my house has been doing it for days." },
            { authorEmail: "emily.rodriguez@example.com", content: "I called the city yesterday, they said they'd check it out." }
        ]
    },
    {
        authorEmail: "mike.chen@example.com",
        content: "Just a reminder that the annual block party planning meeting is this Saturday at the community center! We need volunteers for the grill station.",
        category: "Events",
        comments: []
    },
    {
        authorEmail: "emily.rodriguez@example.com",
        content: "Found a set of keys near the park entrance. Describe them and I'll drop them off!",
        category: "Lost & Found",
        comments: []
    }
];

const SERVICES_DATA = [
    {
        name: "Joe's Handyman Services",
        category: "Handyman",
        phone: "(555) 123-4567",
        rating: "4.8",
        recommendedBy: "Sarah Jenkins",
        description: "Fixed my fence and leaky faucet. Very reliable and fair pricing."
    },
    {
        name: "Eco Tree Removal",
        category: "Tree Service",
        phone: "(555) 987-6543",
        rating: "5.0",
        recommendedBy: "Mike Chen",
        description: "Removed a large oak that was threatening my roof. Cleaned up everything perfectly."
    }
];

const LOCAL_PLACES_DATA = [
    {
        name: "Luigi's Trattoria",
        category: "Restaurant",
        rating: "4.9",
        address: "123 Main St",
        description: "Italian Restaurant - 0.5 miles away"
    },
    {
        name: "The Daily Grind",
        category: "Restaurant",
        rating: "4.7",
        address: "456 Oak Ave",
        description: "Coffee Shop - 0.8 miles away"
    }
];

const RESOURCES_DATA = [
    {
        name: "Community Center Main Hall",
        type: "Facility",
        capacity: 100,
        description: "Large hall suitable for parties and meetings.",
        isReservable: true
    },
    {
        name: "Ride-on Lawnmower",
        type: "Tool",
        capacity: 1,
        description: "Shared community lawnmower. Fuel not included.",
        isReservable: true
    }
];

const HOA_DOCS_DATA = [
    {
        name: "HOA Bylaws & Covenants",
        category: "Rules",
        url: "#",
        size: "2.4 MB"
    }
];

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import("@/db");
    const { users, members, forumPosts, forumComments, serviceProviders, localPlaces, resources, documents, directMessages } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    console.log("🌱 Seeding Real Data...");

    // 1. Create Additional Users/Members
    const memberMap = new Map<string, string>(); // email -> memberId
    // Assume current user (me) exists
    // memberMap.set("me", MY_MEMBER_ID); 

    for (const u of ADDITIONAL_USERS) {
        // Upsert User
        let userResults = await db.select().from(users).where(eq(users.email, u.email));
        let userId;
        if (userResults.length === 0) {
            const [newUser] = await db.insert(users).values({
                email: u.email,
                name: u.name,
                password: "password123" // dummy
            }).returning();
            userId = newUser.id;
        } else {
            userId = userResults[0].id;
        }

        // Upsert Member
        // Naively insert connection, ignoring duplicate error strictly for this quick seed script
        // or check fetching existing members for this community first if possible.
        // Since we lack 'and' in imports above for complex query, let's try insert and catch error, or assume clean db
        try {
            const [newMember] = await db.insert(members).values({
                userId: userId,
                communityId: COMMUNITY_ID,
                role: 'Resident'
            }).returning();
            memberMap.set(u.email, newMember.id);
        } catch (e) {
            // Likely duplicate member, try fetch ID
            // Simple fetch assuming one member record per user (which is true for now mostly)
            const [existing] = await db.select().from(members).where(eq(members.userId, userId));
            if (existing) memberMap.set(u.email, existing.id);
        }
    }

    // 2. Insert Forum Posts & Comments
    console.log("Inserting Forum Posts...");
    for (const post of FORUM_POSTS_DATA) {
        const authorId = memberMap.get(post.authorEmail);
        if (!authorId) {
            console.warn(`Skipping post by ${post.authorEmail} (member not found)`);
            continue;
        }

        const [newPost] = await db.insert(forumPosts).values({
            communityId: COMMUNITY_ID,
            authorId: authorId,
            content: post.content,
            category: post.category
        }).returning();

        for (const comment of post.comments) {
            const commentAuthorId = memberMap.get(comment.authorEmail);
            if (!commentAuthorId) continue;
            await db.insert(forumComments).values({
                postId: newPost.id,
                authorId: commentAuthorId,
                content: comment.content
            });
        }
    }

    // 3. Insert Service Providers
    console.log("Inserting Services...");
    for (const svc of SERVICES_DATA) {
        await db.insert(serviceProviders).values({
            communityId: COMMUNITY_ID,
            name: svc.name,
            category: svc.category,
            phone: svc.phone,
            rating: svc.rating, // String "4.8"
            description: svc.description,
            recommendedBy: svc.recommendedBy
        });
    }

    // 4. Insert Local Places
    console.log("Inserting Local Places...");
    for (const place of LOCAL_PLACES_DATA) {
        await db.insert(localPlaces).values({
            communityId: COMMUNITY_ID,
            name: place.name,
            category: place.category,
            address: place.address,
            description: place.description,
            rating: place.rating
        });
    }

    // 5. Insert Resources
    console.log("Inserting Resources...");
    for (const res of RESOURCES_DATA) {
        await db.insert(resources).values({
            communityId: COMMUNITY_ID,
            name: res.name,
            type: res.type as "Facility" | "Tool" | "Vehicle",
            capacity: res.capacity,
            description: res.description,
            isReservable: res.isReservable
        });
    }

    // 6. Insert HOA Documents
    console.log("Inserting HOA Docs...");
    for (const doc of HOA_DOCS_DATA) {
        await db.insert(documents).values({
            communityId: COMMUNITY_ID,
            name: doc.name,
            category: doc.category,
            url: doc.url,
            size: doc.size,
            uploaderId: MY_MEMBER_ID
        });
    }

    // 7. Insert Messages
    console.log("Inserting Messages...");
    const sarahId = memberMap.get("sarah.jenkins@example.com");
    if (sarahId) {
        await db.insert(directMessages).values({
            senderId: sarahId,
            recipientId: MY_MEMBER_ID,
            content: "Hey Eric! Do you still have that power drill?"
        });
        await db.insert(directMessages).values({
            senderId: MY_MEMBER_ID,
            recipientId: sarahId,
            content: "Yes I do! You can swing by anytime."
        });
    }

    console.log("✅ Database seeded with real test data!");
    process.exit(0);
}

main();
