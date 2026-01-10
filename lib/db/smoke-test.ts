
import { pool } from './db';
import { getLeaderboard, getRunningActivities, getRunningStats, getStravaConnectionByUserId } from './models/strava';
import { getUserByEmail } from './models/user';

async function runSmokeTest() {
  console.log("🔥 Starting Backend Smoke Test...\n");
  let passed = true;

  try {
    // 1. Check Users
    console.log("1️⃣  Verifying Users...");
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userResult.rows[0].count, 10);
    console.log(`   Found ${userCount} users.`);
    if (userCount === 0) throw new Error("No users found! Did seed run?");
    
    // Pick a random user for testing
    const userRes = await pool.query('SELECT * FROM users LIMIT 1');
    const testUser = userRes.rows[0];
    console.log(`   Testing with user: ${testUser.name} (${testUser.id})`);
    console.log("   ✅ Users check passed.\n");

    // 2. Check Activities
    console.log("2️⃣  Verifying Activities...");
    const activityResult = await pool.query('SELECT COUNT(*) as count FROM running_activities');
    const activityCount = parseInt(activityResult.rows[0].count, 10);
    console.log(`   Found ${activityCount} total activities.`);
    if (activityCount === 0) throw new Error("No activities found!");
    console.log("   ✅ Activities check passed.\n");

    // 3. Test Stats Calculation
    console.log("3️⃣  Testing Stats Calculation...");
    const stats = await getRunningStats(testUser.id);
    console.log(`   Stats for ${testUser.name}:`, stats);
    if (!stats) throw new Error("Stats calculation returned null/undefined");
    console.log("   ✅ Stats check passed.\n");

    // 4. Test Leaderboard Query
    console.log("4️⃣  Testing Leaderboard (Weekly)...");
    const weekLeaderboard = await getLeaderboard('week', 3);
    console.log("   Top 3 Weekly Runners:");
    weekLeaderboard.forEach(entry => 
      console.log(`   - #${entry.rank} ${entry.name}: ${(entry.total_distance / 1000).toFixed(2)}km`)
    );
    if (weekLeaderboard.length === 0) console.warn("   ⚠️  Weekly leaderboard empty (might be expected if no runs this week).");
    else console.log("   ✅ Leaderboard check passed.\n");

    // 5. Test Pagination Query
    console.log("5️⃣  Testing Pagination Query...");
    const page1 = await getRunningActivities(testUser.id, 1, 5);
    console.log(`   Page 1 (Limit 5) returned ${page1.activities.length} items. Total count: ${page1.total}`);
    
    if (page1.activities.length > 5) throw new Error("Pagination limit ignored!");
    if (page1.total === 0) console.warn("   ⚠️  User has no activities.");
    
    if (page1.total > 5) {
      const page2 = await getRunningActivities(testUser.id, 2, 5);
      console.log(`   Page 2 returned ${page2.activities.length} items.`);
      if (page2.activities[0].id === page1.activities[0].id) throw new Error("Pagination offset failed (Page 1 == Page 2)!");
    }
    console.log("   ✅ Pagination check passed.\n");

  } catch (error) {
    console.error("❌ Smoke Test FAILED:", error);
    passed = false;
  } finally {
    await pool.end();
  }

  if (passed) {
    console.log("✨ All backend checks passed successfully!");
  } else {
    console.error("💥 Verify existing issues above.");
    process.exit(1);
  }
}

runSmokeTest();
