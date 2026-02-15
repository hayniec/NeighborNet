
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Dynamic imports will be used inside main()
// import { createEvent, getCommunityEvents } from "@/app/actions/events";
// import { createMarketplaceItem, getCommunityMarketplaceItems } from "@/app/actions/marketplace";

// Known valid IDs from dev environment setup
const MEMBER_ID = "cd48f9df-4096-4f8d-b76c-9a6dca90ceab";
const COMMUNITY_ID = "2bf6bc8a-899c-4e29-8ee7-f2038c804260";

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { createEvent } = await import("@/app/actions/events");
    const { createMarketplaceItem } = await import("@/app/actions/marketplace");

    console.log("🚀 Starting Backend Verification...");
    console.log(`Context: Member=${MEMBER_ID}, Community=${COMMUNITY_ID}`);

    // 1. Test Event Creation
    console.log("\n---------------------------------------------------");
    console.log("1. Testing Event Creation...");
    try {
        const eventData = {
            communityId: COMMUNITY_ID,
            title: "Test Event " + Date.now(),
            description: "Automated test event description",
            date: "2024-12-25",
            time: "12:00",
            location: "Test Location",
            category: "Social", // Valid category matches schema check
            organizerId: MEMBER_ID
        };

        const res = await createEvent(eventData);
        if (res.success) {
            console.log("✅ Event Created Successfully:", res.data.id);
        } else {
            console.error("❌ Event Creation Failed:", res.error);
        }
    } catch (e) {
        console.error("❌ Event Creation Exception:", e);
    }

    // 2. Test Marketplace Creation
    console.log("\n---------------------------------------------------");
    console.log("2. Testing Marketplace Item Creation...");
    try {
        const itemData = {
            communityId: COMMUNITY_ID,
            title: "Test Item " + Date.now(),
            description: "Automated test item description",
            price: "10.00",
            isFree: false,
            isNegotiable: true,
            images: [],
            sellerId: MEMBER_ID
        };

        const res = await createMarketplaceItem(itemData);
        if (res.success) {
            console.log("✅ Marketplace Item Created Successfully:", res.data.id);
        } else {
            console.error("❌ Marketplace Item Creation Failed:", res.error);
        }
    } catch (e) {
        console.error("❌ Marketplace Item Creation Exception:", e);
    }

    console.log("\n---------------------------------------------------");
    console.log("🏁 Verification Complete.");
    process.exit(0);
}

main();
