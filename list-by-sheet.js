import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Read firebase config to get project ID
const firebaseConfigPath = './src/firebase.js';
const configContent = readFileSync(firebaseConfigPath, 'utf-8');
const configMatch = configContent.match(/projectId: "([^"]+)"/);

if (!configMatch) {
  console.error('Could not find projectId in firebase config');
  process.exit(1);
}

const projectId = configMatch[1];

// Initialize Firebase Admin with application default credentials
admin.initializeApp({
  projectId: projectId
});

const db = admin.firestore();

async function listWellsBySheet() {
  try {
    // Get all gauge sheets
    const gaugeSheetsSnapshot = await db.collection('gaugeSheets').get();
    
    if (gaugeSheetsSnapshot.empty) {
      console.log('No gauge sheets found');
      process.exit(0);
    }
    
    // Iterate through each gauge sheet
    for (const sheetDoc of gaugeSheetsSnapshot.docs) {
      const sheetId = sheetDoc.id;
      const sheetName = sheetDoc.data().name || sheetId;
      
      console.log(`\n=== ${sheetId} (${sheetName}) ===`);
      
      // Get wells for this gauge sheet
      const wellsSnapshot = await db.collection(`gaugeSheets/${sheetId}/wells`).get();
      
      const wellNames = [];
      wellsSnapshot.forEach(wellDoc => {
        const wellData = wellDoc.data();
        const wellName = wellData.name || wellDoc.id;
        wellNames.push(wellName);
      });
      
      wellNames.sort();
      console.log(wellNames.join(', '));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listWellsBySheet();
