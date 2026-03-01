/**
 * Export leaderboard data to CSV.
 * Run: node scripts/export-data.js [weeks]
 * Uses Firebase client env vars. For headless, set NEXT_PUBLIC_* and run with node.
 * Or use Firebase Admin SDK with service account.
 */

const admin = require('firebase-admin');
const fs = require('fs');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'family-weights';
const weeks = parseInt(process.argv[2], 10) || null;

if (!admin.apps.length) {
  try {
    admin.initializeApp({ projectId: PROJECT_ID });
  } catch (e) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS for service account.');
    process.exit(1);
  }
}

const db = admin.firestore();

function getWeekStartAgo(w) {
  const d = new Date();
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() - w * 7 + mondayOffset);
  return d.toISOString().slice(0, 10);
}

async function exportData() {
  const usersSnap = await db.collection('users').get();
  const weightsSnap = await db.collection('weights').get();

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const weightsByUser = {};
  const minDate = weeks ? getWeekStartAgo(weeks) : null;

  weightsSnap.docs.forEach((d) => {
    const data = d.data();
    const key = data.weekStart || data.date;
    if (!key || !data.userId) return;
    if (minDate && key < minDate) return;
    if (!weightsByUser[data.userId]) weightsByUser[data.userId] = [];
    weightsByUser[data.userId].push(data);
  });

  const rows = [];
  for (const u of users) {
    const wList = (weightsByUser[u.id] || []).sort((a, b) =>
      (b.weekStart || b.date || '').localeCompare(a.weekStart || a.date || '')
    );
    const current = wList[0]?.weight;
    const start = u.startWeight;
    const delta = start != null && current != null ? start - current : null;
    rows.push({
      name: u.name || u.email || '—',
      email: u.email || '—',
      startWeight: start ?? '—',
      currentWeight: current ?? '—',
      delta: delta != null ? delta : '—',
      weeksLogged: wList.length,
    });
  }
  rows.sort((a, b) => (Number(b.delta) || -Infinity) - (Number(a.delta) || -Infinity));

  const header = 'Name,Email,Start (lbs),Current (lbs),Delta,Weeks Logged';
  const csv = [header, ...rows.map((r) =>
    [r.name, r.email, r.startWeight, r.currentWeight, r.delta, r.weeksLogged].join(',')
  )].join('\n');

  const out = `export-leaderboard-${weeks ? weeks + 'w' : 'all'}-${Date.now()}.csv`;
  fs.writeFileSync(out, csv, 'utf8');
  console.log(`Exported ${rows.length} rows to ${out}`);
}

exportData().catch((e) => {
  console.error(e);
  process.exit(1);
});
