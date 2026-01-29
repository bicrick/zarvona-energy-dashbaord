import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listAllWells() {
  const sheets = await db.collection('gaugeSheets').get();
  
  for (const sheet of sheets.docs) {
    console.log(`\n=== ${sheet.id} (${sheet.data().name}) ===`);
    const wells = await db.collection(`gaugeSheets/${sheet.id}/wells`).get();
    const wellNames = wells.docs.map(w => w.data().name).sort();
    console.log(wellNames.join(', '));
  }
}

listAllWells().then(() => process.exit(0));
