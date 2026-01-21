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

async function listAllWells() {
  console.log('\n=== LISTING ALL WELLS IN DATABASE ===\n');
  console.log(`Project: ${projectId}\n`);
  
  try {
    // First, get all gauge sheets
    const gaugeSheetsSnapshot = await db.collection('gaugeSheets').get();
    
    if (gaugeSheetsSnapshot.empty) {
      console.log('No gauge sheets found in database.');
      process.exit(0);
    }
    
    console.log(`Found ${gaugeSheetsSnapshot.size} gauge sheet(s)\n`);
    
    let totalWells = 0;
    const allWellsList = [];
    
    // Iterate through each gauge sheet
    for (const sheetDoc of gaugeSheetsSnapshot.docs) {
      const sheetData = sheetDoc.data();
      const sheetId = sheetDoc.id;
      const sheetName = sheetData.name || sheetId;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`GAUGE SHEET: ${sheetName} (${sheetId})`);
      console.log(`${'='.repeat(60)}`);
      
      // Get wells for this gauge sheet
      const wellsSnapshot = await db.collection(`gaugeSheets/${sheetId}/wells`).get();
      
      if (wellsSnapshot.empty) {
        console.log('  No wells found in this gauge sheet.');
      } else {
        console.log(`  Wells: ${wellsSnapshot.size}\n`);
        
        const wells = [];
        wellsSnapshot.forEach(wellDoc => {
          const wellData = wellDoc.data();
          wells.push({
            id: wellDoc.id,
            name: wellData.name || wellDoc.id,
            status: wellData.status || 'active',
            sheetId: sheetId,
            sheetName: sheetName
          });
        });
        
        // Sort wells by name
        wells.sort((a, b) => a.name.localeCompare(b.name));
        
        // Display wells
        wells.forEach((well, index) => {
          console.log(`  ${(index + 1).toString().padStart(3)}. ${well.name} (${well.id}) [${well.status}]`);
          allWellsList.push(well);
        });
        
        totalWells += wells.length;
      }
    }
    
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Gauge Sheets: ${gaugeSheetsSnapshot.size}`);
    console.log(`Total Wells: ${totalWells}`);
    
    // List all unique well names
    const uniqueWellNames = new Set(allWellsList.map(w => w.name));
    console.log(`Unique Well Names: ${uniqueWellNames.size}`);
    
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`ALL WELLS ALPHABETICALLY`);
    console.log(`${'='.repeat(60)}\n`);
    
    allWellsList.sort((a, b) => a.name.localeCompare(b.name));
    allWellsList.forEach((well, index) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${well.name.padEnd(30)} | ${well.sheetName.padEnd(20)} | ${well.status}`);
    });
    
    console.log('\n');
    process.exit(0);
    
  } catch (error) {
    console.error('Error listing wells:', error);
    process.exit(1);
  }
}

listAllWells();
