/**
 * Data Merge Utilities
 * 
 * Merges new Excel-parsed data with existing manually entered data
 * to prevent loss of user-entered information during re-uploads.
 */

/**
 * Merges new sheet data with existing sheet data
 * @param {Object|null|undefined} existingSheet - Existing sheet data from local storage
 * @param {Object} newSheet - New sheet data parsed from Excel
 * @returns {Object} Merged sheet data
 */
export function mergeSheetData(existingSheet, newSheet) {
    // If no existing data, return new data as-is
    if (!existingSheet || !existingSheet.wells) {
        return newSheet;
    }

    // Create a map of existing wells by ID for quick lookup
    const existingWellsById = {};
    existingSheet.wells.forEach(well => {
        existingWellsById[well.id] = well;
    });

    // Merge each new well with existing data if it exists
    const mergedWells = newSheet.wells.map(newWell => {
        const existingWell = existingWellsById[newWell.id];
        if (existingWell) {
            // Mark this well as processed
            delete existingWellsById[newWell.id];
            return mergeWellData(existingWell, newWell);
        } else {
            // New well not in existing data, add as-is
            return newWell;
        }
    });

    // Add any wells from existing data that weren't in the new data
    // (preserve historical data for wells that may have been removed from Excel)
    Object.values(existingWellsById).forEach(well => {
        mergedWells.push(well);
    });

    // Return merged sheet with new metadata but merged wells
    return {
        ...newSheet,
        wells: mergedWells
    };
}

/**
 * Merges a single well's data
 * @param {Object} existingWell - Existing well data
 * @param {Object} newWell - New well data from Excel
 * @returns {Object} Merged well data
 */
export function mergeWellData(existingWell, newWell) {
    // Merge pressure readings: combine both sources and deduplicate by date
    const mergedPressureReadings = mergePressureReadings(
        existingWell.pressureReadings || [],
        newWell.pressureReadings || []
    );

    return {
        // Use new well's parsed data for these fields
        ...newWell,
        
        // Preserve manually entered fields from existing well
        actionItems: existingWell.actionItems || [],
        failureHistory: existingWell.failureHistory || [],
        chemicalProgram: existingWell.chemicalProgram || {
            continuous: { rate: null, chems: '-', ppm: null },
            truckTreat: { rate: null, chems: '-', ppm: null }
        },
        
        // Smart merge pressure readings
        pressureReadings: mergedPressureReadings
    };
}

/**
 * Merges pressure readings from existing and new data
 * Deduplicates by date, keeping Excel value when dates match
 * @param {Array} existingReadings - Existing pressure readings
 * @param {Array} newReadings - New pressure readings from Excel
 * @returns {Array} Merged and deduplicated pressure readings
 */
function mergePressureReadings(existingReadings, newReadings) {
    // Create a map by date for deduplication
    const readingsByDate = {};
    
    // Add existing readings first
    existingReadings.forEach(reading => {
        if (reading && reading.date) {
            const dateKey = normalizeDate(reading.date);
            readingsByDate[dateKey] = reading;
        }
    });
    
    // Add/overwrite with new readings (Excel is source of truth for duplicates)
    newReadings.forEach(reading => {
        if (reading && reading.date) {
            const dateKey = normalizeDate(reading.date);
            readingsByDate[dateKey] = reading;
        }
    });
    
    // Convert back to array and sort by date descending
    const merged = Object.values(readingsByDate);
    merged.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Keep only the 60 most recent readings
    return merged.slice(0, 60);
}

/**
 * Normalizes a date to YYYY-MM-DD format for comparison
 * @param {string|Date} date - Date to normalize
 * @returns {string} Normalized date string
 */
function normalizeDate(date) {
    if (!date) return '';
    if (typeof date === 'string') {
        // Already in YYYY-MM-DD format or can be parsed
        return date.split('T')[0];
    }
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return String(date);
}
