import { appState, STORAGE_KEY } from './config.js';

export function loadDataFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            appState.appData = JSON.parse(stored);
            // Convert date strings back to Date objects for production and wellTests data
            Object.values(appState.appData).forEach(sheet => {
                if (sheet.wells) {
                    sheet.wells.forEach(well => {
                        if (well.production) {
                            well.production = well.production.map(p => ({
                                ...p,
                                date: new Date(p.date)
                            }));
                        }
                        if (well.wellTests) {
                            well.wellTests = well.wellTests.map(t => ({
                                ...t,
                                date: new Date(t.date)
                            }));
                        }
                    });
                }
            });
        }
    } catch (e) {
        console.error('Error loading from storage:', e);
        appState.appData = {};
    }
}

export function saveDataToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.appData));
    } catch (e) {
        console.error('Error saving to storage:', e);
        alert('Error saving data. Storage may be full.');
    }
}
