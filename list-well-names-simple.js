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

async function listWellNamesSimple() {
  try {
    // Get all gauge sheets
    const gaugeSheetsSnapshot = await db.collection('gaugeSheets').get();
    
    if (gaugeSheetsSnapshot.empty) {
      process.exit(0);
    }
    
    const allWellNames = [];
    
    // Iterate through each gauge sheet
    for (const sheetDoc of gaugeSheetsSnapshot.docs) {
      const sheetId = sheetDoc.id;
      
      // Get wells for this gauge sheet
      const wellsSnapshot = await db.collection(`gaugeSheets/${sheetId}/wells`).get();
      
      wellsSnapshot.forEach(wellDoc => {
        const wellData = wellDoc.data();
        const wellName = wellData.name || wellDoc.id;
        allWellNames.push(wellName);
      });
    }
    
    // Sort alphabetically
    allWellNames.sort((a, b) => a.localeCompare(b));
    
    // Output one per line
    allWellNames.forEach(name => {
      console.log(name);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listWellNamesSimple();
