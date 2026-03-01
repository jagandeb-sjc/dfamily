/**
 * Seed sample users and weights for testing.
 * Run: FIREBASE_PROJECT_ID=family-weights node scripts/seed-sample-data.js
 * Requires GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON).
 */

const admin = require('firebase-admin');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'family-weights';

if (!admin.apps.length) {
  try {
    admin.initializeApp({ projectId: PROJECT_ID });
  } catch (e) {
    console.error('Admin init failed. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID.');
    process.exit(1);
  }
}

const db = admin.firestore();

function getWeekStartAgo(weeksAgo) {
  const d = new Date();
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() - weeksAgo * 7 + mondayOffset);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  const sampleUsers = [
    { name: 'Alex', startWeight: 200, targetWeight: 160, email: 'alex@example.com' },
    { name: 'Sam', startWeight: 180, targetWeight: 150, email: 'sam@example.com' },
    { name: 'Jordan', startWeight: 220, targetWeight: 180, email: 'jordan@example.com' },
  ];

  const weightProgressions = [
    [200, 198, 196, 194],
    [178, 178, 176, 176],
    [222, 220, 218, 220],
  ];

  for (let i = 0; i < sampleUsers.length; i++) {
    const u = sampleUsers[i];
    const id = `seed-user-${i + 1}`;
    const weights = weightProgressions[i] || [u.startWeight - 2, u.startWeight - 4];
    await db.collection('users').doc(id).set({
      ...u,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    for (let w = 0; w < weights.length; w++) {
      const weekStart = getWeekStartAgo(w);
      await db.collection('weights').add({
        userId: id,
        weight: weights[w],
        weekStart,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
  console.log(`Seeded ${sampleUsers.length} users with weight data (weekStart model).`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
