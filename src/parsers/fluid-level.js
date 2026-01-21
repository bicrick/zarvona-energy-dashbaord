/**
 * Fluid Level Sheet Parser
 * Expected file: West Texas Fluid Level Sheet.xlsx
 * Extracts fluid level readings for wells over time
 * 
 * Format Notes:
 * - Column A: Date
 * - Column C: Well Name
 * - Column E (SL): Stroke Length
 * - Column F (SPM): Strokes Per Minute
 * - Column G: Run Time
 * - Column P: Gas & Liquid Above Pump
 * - Column Q: Gas Free Liquid Above Pump (ft)
 * - Column R: Pump Intake Pressure
 * 
 * Each row represents one reading for one well on one date
 * Multiple readings per well over time (time-series data)
 */

// Explicit alias mappings for wells with non-obvious transformations
const WELL_NAME_ALIASES = {
    // Rosebud variations
    'Yates 1': 'Rosebud-Yates #1',
    'Rosebud 1': 'Rosebud 20 #1',
    'Rosebud 2': 'Rosebud 20 #2',
    'Rosebud 3': 'Rosebud 20 #3',
    'Rosebud 4': 'Rosebud 20 #4',
    'RoseBud 2': 'Rosebud 20 #2',
    
    // Miles variations
    'Mc-Miles #1': 'Miles #1',
    'Miles 6': 'Miles #1',
    
    // Wemac variations
    'Weman 6': 'Wemac #6',
    'WeMac 6': 'Wemac #6',
    
    // Cowden variations
    '601H': 'Cowden 601H',
    'Red 4251': 'Cowden 601H',
    'Red 4253': 'Cowden 602H',
    
    // Jane variations
    'Janey 1': 'Jane #2',
    'Janey 2': 'Jane #2',
    'Janey 3': 'Jane #2',
    'Janey 4': 'Jane #2',
    'Janey 5': 'Jane #2',
    'JANEY 1': 'Jane #2',
    'JANEY 2': 'Jane #2',
    'JANEY 3': 'Jane #2',
    
    // Berkley typo
    'Berhley 6': 'Berkley #6',
    
    // Cobra variations
    'Cobra-3012': 'Cobra 3012',
    
    // Angus
    'Angus 7-18-1H': '1-37-1H',
    
    // Owen typo
    'Owen 10-2': 'Owens 10-2',
    
    // Big Max special cases
    'Big Max 14SE-4': 'Big Max 14 #4',
    'Butchee': 'Big Max 12 #1'
};

export const FluidLevelParser = {
    id: 'fluid-level',
    name: 'Fluid Level Sheet',
    expectedFileName: 'West Texas Fluid Level Sheet.xlsx',
    
    // Debug mode - set to true to see detailed normalization logs
    debugMode: false,
    
    // Track well name statistics for debugging
    wellNameStats: {},

    /**
     * Normalize well name for matching with database wells
     * Handles variations in naming conventions between Excel and database
     */
    normalizeWellName(rawName) {
        if (!rawName) return '';
        
        let wellName = String(rawName).trim();
        const originalName = wellName;
        
        // Check explicit aliases first
        if (WELL_NAME_ALIASES[wellName]) {
            if (this.debugMode) {
                console.log(`[Alias] "${originalName}" → "${WELL_NAME_ALIASES[wellName]}"`);
            }
            return WELL_NAME_ALIASES[wellName];
        }
        
        // ===== CORE NORMALIZATIONS =====
        
        // Fix common typos and naming variations
        wellName = wellName
            .replace(/BIG Max/gi, 'Big Max')           // Standardize Big Max casing
            .replace(/Big MaX/gi, 'Big Max')           // Standardize Big Max casing
            .replace(/Universtiy/gi, 'University')     // Fix typo
            .replace(/Berhley/gi, 'Berkley')           // Fix typo (Berhley → Berkley)
            .replace(/Berkely/gi, 'Berkley')           // Fix typo (Berkely → Berkley)
            .replace(/Shusua/gi, 'Shusa')              // Fix typo
            .replace(/Janey/gi, 'Jane')                // Normalize Jane
            .replace(/JANEY/gi, 'Jane')                // Normalize Jane
            .replace(/Weman/gi, 'Wemac')               // Fix typo
            .replace(/RedRock/gi, 'Red Rock')          // Normalize Red Rock
            .replace(/RoseBud/gi, 'Rosebud')           // Normalize Rosebud
            .replace(/WeMac/gi, 'Wemac')               // Normalize Wemac
            .replace(/Owen\s+/gi, 'Owens ')            // Fix typo Owen → Owens
            .trim();
        
        // ===== UNIVERSITY/ULS PREFIX HANDLING =====
        
        // Remove "University" prefix when followed by specific battery names
        // E.g., "University7 Berkley#1" → "Berkley #1", "University 30 Cobra 3012" → "Cobra 3012"
        wellName = wellName.replace(/^University\s*\d*\s+(Berkley|Cobra|Sawgrass|Pinnacle|FN)\s*/gi, '$1 ');
        
        // Expand Univ to University first, then handle ULS conversions
        wellName = wellName.replace(/^Univ\s+/gi, 'University ');
        
        // Handle ULS-specific patterns
        wellName = wellName
            .replace(/^UL-CDU/gi, 'ULS CDU')           // Normalize UL-CDU
            .replace(/^UL\s+CDU/gi, 'ULS CDU')         // Normalize UL CDU
            .replace(/^UL-/gi, 'ULS ')                 // Normalize UL- prefix
            .replace(/^UL\s+/gi, 'ULS ')               // Normalize UL prefix
            .trim();
        
        // ===== WELL-SPECIFIC NORMALIZATIONS =====
        
        // 1. Cowden special cases (do early to avoid other transformations)
        if (/^602-H$/i.test(wellName)) {
            wellName = 'Cowden 602H';
        }
        
        // 2. Big Max patterns
        if (/^Big Max/i.test(wellName)) {
            // Remove "SE" from patterns like "14SE-4"
            wellName = wellName.replace(/(\d+)SE-(\d+)/i, '$1 #$2');
            // Convert patterns like "Big Max 13-5" → "Big Max 13 #5"
            wellName = wellName.replace(/^(Big Max)\s+(\d+)-(\d+)$/i, '$1 $2 #$3');
            // Convert patterns like "Big Max 1-1" → "Big Max 1 #1"
            wellName = wellName.replace(/^(Big Max)\s+(\d+)\s+-\s*(\d+)$/i, '$1 $2 #$3');
        }
        
        // 3. Shusa patterns - handle both "Shusa 14 - 2" and "Shusa 14-2" formats
        if (/^Shusa/i.test(wellName)) {
            // Convert "Shusa 14 - 2" → "Shusa 14 #2"
            wellName = wellName.replace(/^(Shusa)\s+(\d+)\s*-\s*(\d+)$/i, '$1 $2 #$3');
        }
        
        // 4. Link patterns - "Link 3" → "Link #3"
        if (/^Link\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Link)\s+(\d+)$/i, '$1 #$2');
        }
        
        // 5. Rosebud patterns
        if (/^Rosebud\s+\d+$/i.test(wellName) && !/Rosebud\s+20/i.test(wellName)) {
            // "Rosebud 1" → "Rosebud 20 #1"
            wellName = wellName.replace(/^(Rosebud)\s+(\d+)$/i, '$1 20 #$2');
        } else if (/^Rosebud\s+20-/i.test(wellName)) {
            // "Rosebud 20-1" → "Rosebud 20 #1"
            wellName = wellName.replace(/^(Rosebud)\s+(\d+)-(\d+)$/i, '$1 $2 #$3');
        }
        
        // 6. Polaris patterns - "Polaris 1" → "Polaris #1"
        if (/^Polaris\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Polaris)\s+(\d+)$/i, '$1 #$2');
        }
        
        // 7. Berkley patterns - "Berkley 1" → "Berkley #1"
        if (/^Berkley\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Berkley)\s+(\d+)$/i, '$1 #$2');
        }
        
        // 8. Miles patterns - "Miles 1" → "Miles #1"
        if (/^Miles\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Miles)\s+(\d+)$/i, '$1 #$2');
        }
        
        // 9. Jane patterns - "Jane 2" → "Jane #2"
        if (/^Jane\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Jane)\s+(\d+)$/i, '$1 #$2');
        }
        
        // 10. Wemac patterns - "Wemac 6" → "Wemac #6"
        if (/^Wemac\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Wemac)\s+(\d+)$/i, '$1 #$2');
        }
        
        // 11. M&W patterns - "M&W 1R" → "M&W #1R"
        if (/^M&W\s+\d+R$/i.test(wellName)) {
            wellName = wellName.replace(/^(M&W)\s+(\d+R)$/i, '$1 #$2');
        }
        
        // 12. Pinnacle patterns
        if (/^Pinnacle/i.test(wellName)) {
            // Strip any remaining University prefix
            wellName = wellName.replace(/^University\s*\d*\s+/gi, '');
            // "Pinnacle1" or "Pinnacle1H" → "Pinnacle #1"
            wellName = wellName.replace(/^(Pinnacle)\s*(\d+)H?$/i, '$1 #$2');
            // "Pinnacle 2H" stays as "Pinnacle 2H"
            if (/^Pinnacle\s+\d+H$/i.test(wellName)) {
                // Already in correct format
            }
        }
        
        // 13. Sabrina patterns - "Sabrina 12" → "Sabrina #12"
        if (/^Sabrina\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Sabrina)\s+(\d+)$/i, '$1 #$2');
        }
        
        // 14. Cobra patterns - handle hyphen
        if (/^Cobra\s*-\s*\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(Cobra)\s*-\s*(\d+)$/i, '$1 $2');
        }
        
        // 15. FN patterns - normalize spacing
        if (/^FN\s+\d+$/i.test(wellName)) {
            wellName = wellName.replace(/^(FN)\s+(\d+)$/i, '$1 $2');
        }
        
        // ===== UNIVERSITY/ULS SERIES HANDLING =====
        
        // Handle ULS 1-3 series: "ULS 1-3 1H" → "ULS 1-3-1H"
        if (/^ULS\s+1-3\s+\d+H$/i.test(wellName)) {
            wellName = wellName.replace(/^(ULS)\s+(1-3)\s+(\d+H)$/i, '$1 $2-$3');
        }
        
        // Handle University 1-3 series (after ULS conversion): "University 1-3 1H" → "ULS 1-3-1H"
        if (/^University\s+1-3\s+\d+H$/i.test(wellName)) {
            wellName = wellName.replace(/^University\s+(1-3)\s+(\d+H)$/i, 'ULS $1-$2');
        }
        
        // Handle 1-30, 1-31, 1-36, 1-37 series - strip University prefix
        if (/^University\s+(1-3[0-7])\s+(\d+H)$/i.test(wellName)) {
            wellName = wellName.replace(/^University\s+(1-3[0-7])\s+(\d+H)$/i, '$1-$2');
        }
        
        // Handle bare 1-30 through 1-37 patterns: "1-36 1H" → "1-36-1H"
        if (/^1-3[0-7]\s+\d+H$/i.test(wellName)) {
            wellName = wellName.replace(/^(1-3[0-7])\s+(\d+H)$/i, '$1-$2');
        }
        
        // ===== BARE NUMBER PATTERNS =====
        
        // For bare number patterns that might be Big Max wells
        // (e.g., "13-3" → "Big Max 13 #3", "5-2" → "Big Max 5 #2")
        // Only if it matches X-X pattern where X is 1-2 digits (NOT ending in H)
        if (/^\d{1,2}-\d{1,2}$/.test(wellName)) {
            wellName = wellName.replace(/^(\d{1,2})-(\d{1,2})$/, 'Big Max $1 #$2');
        }
        
        // Handle patterns like "37-6H" → "1-37-6H"
        if (/^\d{2}-\d+H$/i.test(wellName)) {
            const match = wellName.match(/^(\d{2})-(\d+H)$/i);
            if (match) {
                const prefix = match[1];
                const suffix = match[2];
                // Only add "1-" prefix for 30, 31, 36, 37 series
                if (['30', '31', '36', '37'].includes(prefix)) {
                    wellName = `1-${prefix}-${suffix}`;
                }
            }
        }
        
        // Normalize multiple spaces and trim
        wellName = wellName.replace(/\s+/g, ' ').trim();
        
        // Track statistics if in debug mode
        if (this.debugMode && wellName !== originalName) {
            console.log(`[Normalize] "${originalName}" → "${wellName}"`);
        }
        
        return wellName;
    },

    parse(workbook) {
        const result = {
            id: this.id,
            name: this.name,
            lastUpdated: new Date().toISOString(),
            readings: [],
            rawRowCount: 0
        };

        // Reset well name statistics for this parse
        this.wellNameStats = {};
        const rawNameToNormalized = {};

        // Try to find the correct sheet
        // Common sheet names: 'Sheet1', 'Fluid Levels', 'Data', etc.
        let sheet = null;
        const sheetNames = workbook.SheetNames;
        
        // Try common sheet names
        const possibleNames = ['Sheet1', 'Fluid Levels', 'Data', 'Fluid Level', 'Sheet'];
        for (const name of possibleNames) {
            if (sheetNames.includes(name)) {
                sheet = workbook.Sheets[name];
                break;
            }
        }
        
        // If not found, use the first sheet
        if (!sheet && sheetNames.length > 0) {
            sheet = workbook.Sheets[sheetNames[0]];
        }
        
        if (!sheet) {
            console.error('No valid sheet found in Fluid Level file');
            return result;
        }

        const range = XLSX.utils.decode_range(sheet['!ref']);
        
        // Column indices (0-based)
        const COL_DATE = 0;           // Column A
        const COL_WELL_NAME = 2;      // Column C
        const COL_STROKE_LENGTH = 4;  // Column E
        const COL_SPM = 5;            // Column F
        const COL_RUN_TIME = 6;       // Column G
        const COL_GAS_LIQUID = 15;    // Column P
        const COL_GAS_FREE = 16;      // Column Q
        const COL_PUMP_INTAKE = 17;   // Column R

        // Filter to 2025+ data
        const filterDate = new Date('2025-01-01');
        
        // Parse data rows (assuming row 0 is header, data starts at row 1)
        for (let row = 1; row <= range.e.r; row++) {
            // Get date
            const dateCell = sheet[XLSX.utils.encode_cell({ r: row, c: COL_DATE })];
            if (!dateCell || !dateCell.v) {
                continue; // Skip rows without dates
            }

            let date;
            if (dateCell.t === 'n') {
                // Excel date number
                date = XLSX.SSF.parse_date_code(dateCell.v);
                date = new Date(date.y, date.m - 1, date.d);
            } else if (dateCell.t === 'd') {
                // Date object
                date = new Date(dateCell.v);
            } else {
                // Try parsing as string
                date = new Date(dateCell.v);
            }

            // Filter to 2025+
            if (!date || isNaN(date.getTime()) || date < filterDate) {
                continue;
            }

            // Get well name
            const wellNameCell = sheet[XLSX.utils.encode_cell({ r: row, c: COL_WELL_NAME })];
            if (!wellNameCell || !wellNameCell.v) {
                continue; // Skip rows without well names
            }

            const rawWellName = String(wellNameCell.v).trim();
            if (!rawWellName) {
                continue;
            }

            // Normalize the well name to match database conventions
            const wellName = this.normalizeWellName(rawWellName);
            if (!wellName) {
                continue;
            }

            // Track statistics
            if (!this.wellNameStats[wellName]) {
                this.wellNameStats[wellName] = {
                    count: 0,
                    rawNames: new Set()
                };
            }
            this.wellNameStats[wellName].count++;
            this.wellNameStats[wellName].rawNames.add(rawWellName);
            
            // Track mapping from raw to normalized
            if (!rawNameToNormalized[rawWellName]) {
                rawNameToNormalized[rawWellName] = wellName;
            }

            result.rawRowCount++;

            // Extract all fluid level data
            const reading = {
                wellName: wellName,
                rawWellName: rawWellName,  // Keep original for debugging
                date: date.toISOString(),
                strokeLength: this.getCellValue(sheet, row, COL_STROKE_LENGTH),
                spm: this.getCellValue(sheet, row, COL_SPM),
                runTime: this.getCellValue(sheet, row, COL_RUN_TIME),
                gasLiquidLevel: this.getCellValue(sheet, row, COL_GAS_LIQUID),
                gasFreeLevel: this.getCellValue(sheet, row, COL_GAS_FREE),
                pumpIntakePressure: this.getCellValue(sheet, row, COL_PUMP_INTAKE)
            };

            result.readings.push(reading);
        }

        console.log(`Parsed ${result.readings.length} fluid level readings from ${result.rawRowCount} total rows (2025+)`);
        
        // Log well name statistics
        this.logWellNameStatistics(rawNameToNormalized);
        
        return result;
    },
    
    /**
     * Log well name statistics for debugging
     * Shows unique normalized names, their counts, and the raw names they came from
     */
    logWellNameStatistics(rawNameToNormalized) {
        const normalizedNames = Object.keys(this.wellNameStats).sort();
        
        console.log(`\n===== FLUID LEVEL WELL NAME STATISTICS =====`);
        console.log(`Found ${normalizedNames.length} unique normalized well names:`);
        
        // Group by normalized name
        normalizedNames.forEach(normalized => {
            const stats = this.wellNameStats[normalized];
            const rawNames = Array.from(stats.rawNames).sort();
            console.log(`  ${normalized}: ${stats.count} readings`);
            if (rawNames.length > 1 || rawNames[0] !== normalized) {
                console.log(`    Raw variations: ${rawNames.join(', ')}`);
            }
        });
        
        // Show raw to normalized mapping summary
        const uniqueRawNames = Object.keys(rawNameToNormalized).sort();
        console.log(`\n===== RAW NAME TRANSFORMATIONS (${uniqueRawNames.length} unique) =====`);
        uniqueRawNames.forEach(raw => {
            const normalized = rawNameToNormalized[raw];
            if (raw !== normalized) {
                console.log(`  "${raw}" → "${normalized}"`);
            }
        });
        
        console.log(`============================================\n`);
    },

    getCellValue(sheet, row, col) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[cellAddress];
        
        if (!cell || cell.v === undefined || cell.v === null || cell.v === '') {
            return null;
        }
        
        // Convert to number if it's numeric
        const value = cell.v;
        if (typeof value === 'number') {
            return value;
        }
        
        // Try to parse as number
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            return parsed;
        }
        
        // Return as string if not a number
        return String(value);
    }
};
