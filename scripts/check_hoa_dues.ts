import { db } from '../db';
import { communities } from '../db/schema';
import { eq } from 'drizzle-orm';

async function checkHoaDues() {
    try {
        console.log('Fetching all communities...');
        const allCommunities = await db.select().from(communities);

        console.log('\n=== HOA Dues Check ===\n');

        for (const community of allCommunities) {
            console.log(`Community: ${community.name} (ID: ${community.id})`);
            console.log(`  hoaDuesAmount: "${community.hoaDuesAmount}" (Type: ${typeof community.hoaDuesAmount})`);
            console.log(`  hoaDuesFrequency: "${community.hoaDuesFrequency}"`);
            console.log(`  hoaDuesDate: "${community.hoaDuesDate}"`);
            console.log(`  hoaContactEmail: "${community.hoaContactEmail}"`);
            console.log('---');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkHoaDues();
