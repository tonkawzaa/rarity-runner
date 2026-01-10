
import { pool } from './db';
import { upsertUser } from './models/user';
import { saveRunningActivity } from './models/strava';
import { randomUUID } from 'crypto';

const NAMES = [
  "Alice Runner", "Bob Sprinter", "Charlie Jogger", "Diana Dash", 
  "Evan Endurance", "Fiona Fast", "George Gallop", "Hannah Hurdle", 
  "Ian Interval", "Julia Jog", "Kevin Kilometer", "Liam Lap"
];

const ACTIVITY_TYPES = ["Run", "Trail Run"];

async function main() {
  console.log("🌱 Starting seed...");

  try {
    for (const name of NAMES) {
      const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
      const userId = randomUUID();
      
      console.log(`👤 Creating user: ${name}`);
      
      const user = await upsertUser({
        id: userId,
        email,
        name,
        image: `https://api.dicebear.com/7.x/avataaars/png?seed=${name}`,
        email_verified: true
      });

      // Create 25 activities for each user
      const activities = [];
      const now = new Date();
      
      for (let i = 0; i < 25; i++) {
        // Random date within last year
        const daysAgo = Math.floor(Math.random() * 365);
        const activityDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        
        // Random stats
        const distance = Math.floor(3000 + Math.random() * 15000); // 3km - 18km
        const speed = 2.5 + Math.random() * 2.5; // 2.5m/s - 5.0m/s
        const duration = Math.floor(distance / speed); 
        
        // Ensure activities are spread out (Week/Month/Year testing)
        // We ensure at least some are recent (last 7 days)
        if (i < 3) {
             const recentDays = Math.floor(Math.random() * 7);
             activityDate.setTime(now.getTime() - (recentDays * 24 * 60 * 60 * 1000));
        }

        const activity = {
          id: Math.floor(Math.random() * 1000000000), // Fake Strava ID
          name: `${i % 5 === 0 ? 'Long Run' : 'Morning Run'} - ${activityDate.toLocaleDateString()}`,
          distance,
          moving_time: duration,
          elapsed_time: Math.floor(duration + (Math.random() * 300)),
          total_elevation_gain: Math.floor(Math.random() * 200),
          type: ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)],
          start_date: activityDate.toISOString(),
          start_date_local: activityDate.toISOString(),
          timezone: "(GMT+07:00) Asia/Bangkok",
          average_speed: Number(speed.toFixed(2)),
          max_speed: Number((speed * 1.2).toFixed(2)),
          average_heartrate: Math.floor(130 + Math.random() * 40),
          max_heartrate: Math.floor(170 + Math.random() * 20),
          calories: Math.floor(duration * 0.15), // Rough estimate
          map: { summary_polyline: "" }
        };

        activities.push(saveRunningActivity(user.id, activity));
      }
      
      await Promise.all(activities);
      console.log(`✅ Created ${activities.length} activities for ${name}`);
    }

    console.log("✨ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

main();
