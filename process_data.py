#!/usr/bin/env python3
"""
CSV to JSON Processor for Oil Well Dashboard
Reads extracted CSV files and generates wells.json for the dashboard
"""

import pandas as pd
import json
import os
import re
from datetime import datetime

DATA_DIR = 'data'
OUTPUT_FILE = 'data/wells.json'


def parse_well_test_file(filepath, battery_name):
    """Parse a well test CSV file and extract well test data per well."""
    wells = {}
    
    try:
        # Read header row to get well names
        header_df = pd.read_csv(filepath, nrows=1, header=None)
        
        # Find columns with well names (contain "24HR Test")
        well_columns = {}
        for col_idx, val in enumerate(header_df.iloc[0]):
            if pd.notna(val) and '24HR Test' in str(val):
                # Extract well name (remove "24HR Test" suffix)
                well_name = str(val).replace(' 24HR Test', '').strip()
                well_columns[well_name] = col_idx
        
        if not well_columns:
            return wells
        
        # Read data starting from row 3 (after headers)
        df = pd.read_csv(filepath, skiprows=3, header=None, low_memory=False)
        
        # First column should be DATE
        date_col = 0
        
        for well_name, start_col in well_columns.items():
            well_tests = []
            
            for idx, row in df.iterrows():
                try:
                    date_val = row[date_col]
                    if pd.isna(date_val):
                        continue
                    
                    # Parse date
                    date_str = str(date_val).split(' ')[0]  # Remove time portion
                    
                    # Get OIL, WATER, GAS (columns start_col+1, start_col+2, start_col+3)
                    oil = row[start_col + 1] if start_col + 1 < len(row) else None
                    water = row[start_col + 2] if start_col + 2 < len(row) else None
                    gas = row[start_col + 3] if start_col + 3 < len(row) else None
                    
                    # Skip if all values are NaN
                    if pd.isna(oil) and pd.isna(water) and pd.isna(gas):
                        continue
                    
                    well_tests.append({
                        'date': date_str,
                        'oil': float(oil) if pd.notna(oil) else None,
                        'water': float(water) if pd.notna(water) else None,
                        'gas': float(gas) if pd.notna(gas) else None
                    })
                except Exception as e:
                    continue
            
            if well_tests:
                wells[well_name] = well_tests
    
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    
    return wells


def parse_run_tickets(filepath):
    """Parse run tickets CSV file."""
    tickets = []
    
    try:
        df = pd.read_csv(filepath, skiprows=2, header=0, low_memory=False)
        
        # Rename columns based on expected structure
        if len(df.columns) >= 8:
            cols = ['prod_date', 'ticket_num', 'tank_num', 'top_ft', 'top_in', 
                    'bottom_ft', 'bottom_in', 'calc_vol', 'ticket_vol', 
                    'gravity', 'bsw', 'seal_off', 'seal_on', 'comments']
            df.columns = cols[:len(df.columns)]
        
        for idx, row in df.iterrows():
            try:
                if pd.isna(row.get('ticket_num')):
                    continue
                
                date_val = row.get('prod_date', '')
                if pd.notna(date_val):
                    date_str = str(date_val).split(' ')[0]
                else:
                    date_str = None
                
                tickets.append({
                    'date': date_str,
                    'ticketNum': str(row.get('ticket_num', '')),
                    'tank': int(row['tank_num']) if pd.notna(row.get('tank_num')) else None,
                    'ftTop': float(row['top_ft']) if pd.notna(row.get('top_ft')) else None,
                    'inTop': float(row['top_in']) if pd.notna(row.get('top_in')) else None,
                    'ftBttm': float(row['bottom_ft']) if pd.notna(row.get('bottom_ft')) else None,
                    'inBttm': float(row['bottom_in']) if pd.notna(row.get('bottom_in')) else None,
                    'vol': float(row['ticket_vol']) if pd.notna(row.get('ticket_vol')) else None
                })
            except Exception as e:
                continue
    
    except Exception as e:
        print(f"Error parsing run tickets {filepath}: {e}")
    
    # Filter out entries without dates and sort
    tickets = [t for t in tickets if t['date']]
    tickets.sort(key=lambda x: x['date'], reverse=True)
    
    return tickets[:100]  # Return last 100 tickets


def create_well_object(well_id, well_name, well_tests):
    """Create a well object with all its data."""
    # Sort well tests by date
    well_tests_sorted = sorted(well_tests, key=lambda x: x['date'])
    
    # Create production data from well tests (oil values)
    production = [
        {'date': t['date'], 'oil': t['oil']}
        for t in well_tests_sorted
        if t['oil'] is not None
    ]
    
    # Get recent well tests (last 10)
    recent_tests = well_tests_sorted[-10:] if len(well_tests_sorted) > 10 else well_tests_sorted
    recent_tests.reverse()  # Most recent first
    
    return {
        'id': well_id,
        'name': well_name,
        'status': 'active',
        'wellTests': recent_tests,
        'production': production,
        'chemicalProgram': {
            'continuous': {'rate': None, 'chems': '-', 'ppm': None},
            'truckTreat': {'rate': None, 'chems': '-', 'ppm': None}
        },
        'failureHistory': [],
        'pressureReadings': [],
        'actionItems': []
    }


def process_cowden():
    """Process Cowden battery data."""
    print("Processing Cowden...")
    
    battery = {
        'id': 'cowden',
        'name': 'Cowden',
        'leaseId': 'zarvona',
        'wells': [],
        'tanks': [],
        'runTickets': [],
        'actionItems': []
    }
    
    # Parse well tests
    well_test_file = os.path.join(DATA_DIR, 'Cowden_Well_Test.csv')
    if os.path.exists(well_test_file):
        wells_data = parse_well_test_file(well_test_file, 'Cowden')
        
        for well_name, tests in wells_data.items():
            well_id = well_name.lower().replace(' ', '-').replace('#', '')
            well = create_well_object(well_id, well_name, tests)
            battery['wells'].append(well)
            print(f"  - {well_name}: {len(tests)} test records")
    
    # Parse run tickets
    run_tickets_file = os.path.join(DATA_DIR, 'Cowden_Run_Tickets.csv')
    if os.path.exists(run_tickets_file):
        battery['runTickets'] = parse_run_tickets(run_tickets_file)
        print(f"  - Run tickets: {len(battery['runTickets'])} records")
    
    # Default tanks
    battery['tanks'] = [
        {'id': 'OT1', 'ft': 0, 'inches': 0, 'bbl': 0},
        {'id': 'OT2', 'ft': 0, 'inches': 0, 'bbl': 0},
        {'id': 'OT3', 'ft': 0, 'inches': 0, 'bbl': 0},
        {'id': 'OT4', 'ft': 0, 'inches': 0, 'bbl': 0},
        {'id': 'WT1', 'ft': 0, 'inches': 0, 'bbl': 0},
        {'id': 'WT2', 'ft': 0, 'inches': 0, 'bbl': 0}
    ]
    
    return battery


def process_bigmax():
    """Process Big Max battery data."""
    print("Processing Big Max...")
    
    battery = {
        'id': 'bigmax',
        'name': 'Big Max',
        'leaseId': 'zarvona',
        'wells': [],
        'tanks': [],
        'runTickets': [],
        'actionItems': []
    }
    
    # Parse well tests
    well_test_file = os.path.join(DATA_DIR, 'BigMax_Well_Test.csv')
    if os.path.exists(well_test_file):
        wells_data = parse_well_test_file(well_test_file, 'Big Max')
        
        for well_name, tests in wells_data.items():
            well_id = well_name.lower().replace(' ', '-').replace('#', '')
            well = create_well_object(well_id, well_name, tests)
            battery['wells'].append(well)
            print(f"  - {well_name}: {len(tests)} test records")
    
    # Parse run tickets
    run_tickets_file = os.path.join(DATA_DIR, 'BigMax_Run_Tickets.csv')
    if os.path.exists(run_tickets_file):
        battery['runTickets'] = parse_run_tickets(run_tickets_file)
        print(f"  - Run tickets: {len(battery['runTickets'])} records")
    
    return battery


def process_south_andrews():
    """Process South Andrews battery data."""
    print("Processing South Andrews...")
    
    battery = {
        'id': 'south-andrews',
        'name': 'South Andrews',
        'leaseId': 'zarvona',
        'wells': [],
        'tanks': [],
        'runTickets': [],
        'actionItems': []
    }
    
    # Parse well tests from both pages
    for test_file in ['South_Andrews_Well_Test_pg1.csv', 'South_Andrews_Well_Test_pg2.csv']:
        filepath = os.path.join(DATA_DIR, test_file)
        if os.path.exists(filepath):
            wells_data = parse_well_test_file(filepath, 'South Andrews')
            
            for well_name, tests in wells_data.items():
                # Clean up well name (remove ULS prefix for display)
                display_name = well_name.replace('ULS ', '')
                well_id = well_name.lower().replace(' ', '-').replace('#', '')
                well = create_well_object(well_id, display_name, tests)
                battery['wells'].append(well)
                print(f"  - {display_name}: {len(tests)} test records")
    
    # Parse run tickets from various ticket files
    ticket_files = [
        'South_Andrews_36-4H_Tickets.csv',
        'South_Andrews_37-6H_Tickets.csv'
    ]
    
    all_tickets = []
    for tf in ticket_files:
        filepath = os.path.join(DATA_DIR, tf)
        if os.path.exists(filepath):
            tickets = parse_run_tickets(filepath)
            all_tickets.extend(tickets)
    
    # Sort and limit
    all_tickets.sort(key=lambda x: x['date'] or '', reverse=True)
    battery['runTickets'] = all_tickets[:100]
    print(f"  - Run tickets: {len(battery['runTickets'])} records")
    
    return battery


def process_mwwemac():
    """Process MW-Wemac battery data."""
    print("Processing MW-Wemac...")
    
    battery = {
        'id': 'mw-wemac',
        'name': 'MW-Wemac',
        'leaseId': 'zarvona',
        'wells': [],
        'tanks': [],
        'runTickets': [],
        'actionItems': []
    }
    
    # Parse well tests
    well_test_file = os.path.join(DATA_DIR, 'MwWemac_Well_Test.csv')
    if os.path.exists(well_test_file):
        wells_data = parse_well_test_file(well_test_file, 'MW-Wemac')
        
        for well_name, tests in wells_data.items():
            well_id = well_name.lower().replace(' ', '-').replace('#', '').replace('&', 'and')
            well = create_well_object(well_id, well_name, tests)
            battery['wells'].append(well)
            print(f"  - {well_name}: {len(tests)} test records")
    
    # If no wells from well test, create wells from individual sheets
    if not battery['wells']:
        well_sheets = ['M&W', 'Wemac', 'Berkley', 'Sabrina']
        for ws in well_sheets:
            well_id = ws.lower().replace('&', 'and').replace(' ', '-')
            battery['wells'].append({
                'id': well_id,
                'name': ws,
                'status': 'active',
                'wellTests': [],
                'production': [],
                'chemicalProgram': {
                    'continuous': {'rate': None, 'chems': '-', 'ppm': None},
                    'truckTreat': {'rate': None, 'chems': '-', 'ppm': None}
                },
                'failureHistory': [],
                'pressureReadings': [],
                'actionItems': []
            })
            print(f"  - {ws}: (no test data)")
    
    return battery


def main():
    """Main processing function."""
    print("=" * 60)
    print("Processing CSV files to JSON")
    print("=" * 60)
    
    # Build the data structure
    data = {
        'leases': [
            {
                'id': 'zarvona',
                'name': 'Zarvona Energy',
                'batteries': []
            }
        ]
    }
    
    # Process each battery
    batteries = [
        process_cowden(),
        process_bigmax(),
        process_south_andrews(),
        process_mwwemac()
    ]
    
    # Add batteries to lease
    data['leases'][0]['batteries'] = batteries
    
    # Calculate stats
    total_wells = sum(len(b['wells']) for b in batteries)
    total_batteries = len(batteries)
    
    print("=" * 60)
    print(f"Total: {total_batteries} batteries, {total_wells} wells")
    print("=" * 60)
    
    # Write JSON output
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nOutput written to: {OUTPUT_FILE}")
    print(f"File size: {os.path.getsize(OUTPUT_FILE) / 1024:.1f} KB")


if __name__ == '__main__':
    main()
