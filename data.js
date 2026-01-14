// Data loader for Oil Well Dashboard
// Fetches wells.json and provides helper functions

let mockData = null;
let dataLoaded = false;
let loadCallbacks = [];

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('data/wells.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        mockData = await response.json();
        dataLoaded = true;
        
        // Convert production dates to Date objects for Chart.js
        mockData.leases.forEach(lease => {
            lease.batteries.forEach(battery => {
                battery.wells.forEach(well => {
                    if (well.production) {
                        well.production = well.production.map(p => ({
                            date: new Date(p.date),
                            oil: p.oil
                        }));
                    }
                });
            });
        });
        
        // Notify any waiting callbacks
        loadCallbacks.forEach(cb => cb());
        loadCallbacks = [];
        
        console.log('Data loaded successfully');
        return mockData;
    } catch (error) {
        console.error('Error loading data:', error);
        // Fall back to empty data structure
        mockData = {
            leases: [{
                id: 'zarvona',
                name: 'Zarvona Energy',
                batteries: []
            }]
        };
        dataLoaded = true;
        return mockData;
    }
}

// Wait for data to be loaded
function onDataLoaded(callback) {
    if (dataLoaded) {
        callback();
    } else {
        loadCallbacks.push(callback);
    }
}

// Helper function to get all wells across all batteries
function getAllWells() {
    if (!mockData) return [];
    
    const wells = [];
    mockData.leases.forEach(lease => {
        lease.batteries.forEach(battery => {
            battery.wells.forEach(well => {
                wells.push({
                    ...well,
                    leaseName: lease.name,
                    batteryName: battery.name
                });
            });
        });
    });
    return wells;
}

// Helper function to get all batteries
function getAllBatteries() {
    if (!mockData) return [];
    
    const batteries = [];
    mockData.leases.forEach(lease => {
        lease.batteries.forEach(battery => {
            batteries.push({
                ...battery,
                leaseName: lease.name
            });
        });
    });
    return batteries;
}

// Helper function to find a well by ID
function getWellById(wellId) {
    if (!mockData) return null;
    
    for (const lease of mockData.leases) {
        for (const battery of lease.batteries) {
            for (const well of battery.wells) {
                if (well.id === wellId) {
                    return {
                        ...well,
                        leaseName: lease.name,
                        batteryName: battery.name
                    };
                }
            }
        }
    }
    return null;
}

// Helper function to find a battery by ID
function getBatteryById(batteryId) {
    if (!mockData) return null;
    
    for (const lease of mockData.leases) {
        for (const battery of lease.batteries) {
            if (battery.id === batteryId) {
                return {
                    ...battery,
                    leaseName: lease.name
                };
            }
        }
    }
    return null;
}

// Get counts for welcome screen
function getStats() {
    if (!mockData) return { wellCount: 0, batteryCount: 0, leaseCount: 0 };
    
    let wellCount = 0;
    let batteryCount = 0;
    const leaseCount = mockData.leases.length;
    
    mockData.leases.forEach(lease => {
        batteryCount += lease.batteries.length;
        lease.batteries.forEach(battery => {
            wellCount += battery.wells.length;
        });
    });
    
    return { wellCount, batteryCount, leaseCount };
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: '2-digit' 
        });
    } catch {
        return dateStr;
    }
}

// Start loading data immediately
loadData();
