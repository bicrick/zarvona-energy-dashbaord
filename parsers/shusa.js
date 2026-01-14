/**
 * Shusa Gauge Sheet Parser
 * Expected file: Shusa Gauge Sheet.xlsx
 * Has two Well Test sheets with many wells
 */

const ShusaParser = {
    id: 'shusa',
    name: 'Shusa',
    expectedFileName: 'Shusa Gauge Sheet.xlsx',
    
    // Wells from Well Test 20 RB Link (4-column spacing)
    wells20RB: [
        { id: 'shusa-20-1', name: 'Shusa 20 #1', oilCol: 1, waterCol: 2, gasCol: 3 },
        { id: 'shusa-20-2', name: 'Shusa 20 #2', oilCol: 5, waterCol: 6, gasCol: 7 },
        { id: 'shusa-20-3', name: 'Shusa 20 #3', oilCol: 9, waterCol: 10, gasCol: 11 },
        { id: 'shusa-20-4', name: 'Shusa 20 #4', oilCol: 13, waterCol: 14, gasCol: 15 },
        { id: 'shusa-20-5', name: 'Shusa 20 #5', oilCol: 17, waterCol: 18, gasCol: 19 },
        { id: 'rosebud-20-1', name: 'Rosebud 20 #1', oilCol: 21, waterCol: 22, gasCol: 23 },
        { id: 'rosebud-20-3', name: 'Rosebud 20 #3', oilCol: 25, waterCol: 26, gasCol: 27 },
        { id: 'rosebud-20-4', name: 'Rosebud 20 #4', oilCol: 29, waterCol: 30, gasCol: 31 },
        { id: 'link-1', name: 'Link #1', oilCol: 33, waterCol: 34, gasCol: 35 },
        { id: 'link-3', name: 'Link #3', oilCol: 37, waterCol: 38, gasCol: 39 },
        { id: 'link-4', name: 'Link #4', oilCol: 41, waterCol: 42, gasCol: 43 }
    ],
    
    // Wells from Well Test 14 15 (4-column spacing, starts at col 4)
    wells1415: [
        { id: 'shusa-14-1', name: 'Shusa 14 #1', oilCol: 4, waterCol: 5, gasCol: 6 },
        { id: 'shusa-14-2', name: 'Shusa 14 #2', oilCol: 8, waterCol: 9, gasCol: 10 },
        { id: 'shusa-14-3', name: 'Shusa 14 #3', oilCol: 12, waterCol: 13, gasCol: 14 },
        { id: 'shusa-14-4', name: 'Shusa 14 #4', oilCol: 16, waterCol: 17, gasCol: 18 },
        { id: 'shusa-14-5', name: 'Shusa 14 #5', oilCol: 20, waterCol: 21, gasCol: 22 },
        { id: 'shusa-15-1', name: 'Shusa 15 #1', oilCol: 48, waterCol: 49, gasCol: 50 },
        { id: 'shusa-15-2x', name: 'Shusa 15 #2X', oilCol: 52, waterCol: 53, gasCol: 54 },
        { id: 'shusa-15-3', name: 'Shusa 15 #3', oilCol: 56, waterCol: 57, gasCol: 58 },
        { id: 'shusa-15-4', name: 'Shusa 15 #4', oilCol: 60, waterCol: 61, gasCol: 62 }
    ],
    
    parse(workbook) {
        const result = {
            id: this.id,
            name: this.name,
            lastUpdated: new Date().toISOString(),
            wells: [],
            runTickets: [],
            rawRowCount: 0
        };
        
        // Parse both well test sheets
        if (workbook.Sheets['Well Test 20 RB Link']) {
            const data = this.parseWellTestSheet(workbook.Sheets['Well Test 20 RB Link'], this.wells20RB);
            result.wells.push(...data.wells);
            result.rawRowCount = data.rowCount;
        }
        
        if (workbook.Sheets['Well Test 14 15']) {
            const data = this.parseWellTestSheet(workbook.Sheets['Well Test 14 15'], this.wells1415);
            result.wells.push(...data.wells);
        }
        
        // Parse run tickets from multiple sheets
        ['14-15 Run Tickets', '20-RB Run Tickets', 'Link Run Tickets', 'Yates Run Tickets'].forEach(sheetName => {
            if (workbook.Sheets[sheetName]) {
                const tickets = this.parseRunTicketsSheet(workbook.Sheets[sheetName]);
                result.runTickets.push(...tickets);
            }
        });
        
        result.runTickets.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        result.runTickets = result.runTickets.slice(0, 100);
        
        return result;
    },
    
    parseWellTestSheet(sheet, wellDefs) {
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        const wells = wellDefs.map(w => ({
            id: w.id,
            name: w.name,
            status: 'active',
            wellTests: [],
            production: [],
            chemicalProgram: { continuous: { rate: null, chems: '-', ppm: null }, truckTreat: { rate: null, chems: '-', ppm: null } },
            failureHistory: [],
            pressureReadings: [],
            actionItems: []
        }));
        
        let rowCount = 0;
        for (let i = 4; i < data.length; i++) {
            const row = data[i];
            if (!row || !row[0]) continue;
            
            const dateStr = this.parseDate(row[0]);
            if (!dateStr) continue;
            rowCount++;
            
            wellDefs.forEach((wellDef, idx) => {
                const oil = this.parseNumber(row[wellDef.oilCol]);
                const water = this.parseNumber(row[wellDef.waterCol]);
                const gas = this.parseNumber(row[wellDef.gasCol]);
                
                if (oil !== null || water !== null || gas !== null) {
                    wells[idx].wellTests.push({ date: dateStr, oil, water, gas });
                    wells[idx].production.push({ date: new Date(dateStr), oil, water, gas });
                }
            });
        }
        
        wells.forEach(well => {
            well.wellTests.sort((a, b) => new Date(b.date) - new Date(a.date));
            well.wellTests = well.wellTests.slice(0, 20);
            well.production.sort((a, b) => a.date - b.date);
        });
        
        return { wells, rowCount };
    },
    
    parseRunTicketsSheet(sheet) {
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
        const tickets = [];
        
        for (let i = 3; i < data.length; i++) {
            const row = data[i];
            if (!row || !row[1]) continue;
            
            tickets.push({
                date: this.parseDate(row[0]),
                ticketNum: String(row[1] || ''),
                tank: this.parseNumber(row[2]),
                ftTop: this.parseNumber(row[3]),
                inTop: this.parseNumber(row[4]),
                ftBttm: this.parseNumber(row[5]),
                inBttm: this.parseNumber(row[6]),
                vol: this.parseNumber(row[8])
            });
        }
        
        return tickets;
    },
    
    parseDate(val) {
        if (!val) return null;
        if (val instanceof Date) return val.toISOString().split('T')[0];
        if (typeof val === 'number') {
            const date = XLSX.SSF.parse_date_code(val);
            if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
        if (typeof val === 'string') return val.split(' ')[0];
        return null;
    },
    
    parseNumber(val) {
        if (val === null || val === undefined || val === '') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    }
};

if (typeof window !== 'undefined') window.ShusaParser = ShusaParser;
