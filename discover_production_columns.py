#!/usr/bin/env python3
"""
Discover OIL PROD, WATER PROD, GAS PROD column positions in gauge sheets.

This script examines the main gauge sheets to find battery-level production columns.
"""

from pathlib import Path
import pandas as pd

# Configuration for each battery's main gauge sheet
BATTERIES = [
    {
        'name': 'Cowden',
        'file': 'Cowden Gauge Sheet1.xlsx',
        'sheet': 'Cowden',
        'header_row': 7  # 1-based, row 7 is index 6
    },
    {
        'name': 'South Andrews (36-4H)',
        'file': 'South Andrews Gauge Sheet.xlsm',
        'sheet': '36-4H',
        'header_row': 9  # 1-based
    },
    {
        'name': 'South Andrews (37-6H)',
        'file': 'South Andrews Gauge Sheet.xlsm',
        'sheet': '37-6H',
        'header_row': 9  # 1-based
    },
    {
        'name': 'Unit 1-30',
        'file': '1-30 Unit 1H Gauge Sheet.xlsx',
        'sheet': '1-30-1H Gauge Sheet',
        'header_row': 6  # 1-based
    },
    {
        'name': 'ULS 3-5H',
        'file': 'ULS 3-5H Gauge Sheet.xlsx',
        'sheet': 'University 3-5H',
        'header_row': 4  # 1-based
    },
    # These don't have main gauge sheets with pressure data yet
    {
        'name': 'Big Max',
        'file': 'Big Max Gauge Sheet.xlsx',
        'sheet': 'Total',  # Try the Total sheet
        'header_row': None  # Will need to discover
    },
    {
        'name': 'Big Max 1H',
        'file': 'Big Max 1H Gauge Sheet.xlsx',
        'sheet': 'Big Max 1-1H',  # Try the well-specific sheet
        'header_row': None
    },
]

def normalize(value):
    """Normalize cell value to lowercase string."""
    if value is None or pd.isna(value):
        return ""
    return str(value).strip().lower()

def find_production_columns(file_path, sheet_name, header_row_1based=None):
    """Find OIL PROD, WATER PROD, GAS PROD columns in a sheet."""
    try:
        if not file_path.exists():
            return None, f"File not found: {file_path}"
        
        # Read the sheet without header first
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
        
        # Search for production column headers
        oil_col = None
        water_col = None
        gas_col = None
        found_row = None
        
        # Search rows 0-15 for headers
        for row_idx in range(min(15, len(df))):
            row_values = [normalize(v) for v in df.iloc[row_idx].tolist()]
            
            for col_idx, val in enumerate(row_values):
                if 'oil' in val and 'prod' in val:
                    oil_col = col_idx
                    found_row = row_idx
                if 'water' in val and 'prod' in val:
                    water_col = col_idx
                    found_row = row_idx
                if 'gas' in val and 'prod' in val:
                    gas_col = col_idx
                    found_row = row_idx
            
            # If we found at least one, check this row more thoroughly
            if oil_col is not None or water_col is not None or gas_col is not None:
                break
        
        if found_row is None:
            # Try alternative column names
            for row_idx in range(min(15, len(df))):
                row_values = [normalize(v) for v in df.iloc[row_idx].tolist()]
                row_str = ' '.join(row_values)
                
                if 'oil' in row_str and ('bbl' in row_str or 'prod' in row_str):
                    found_row = row_idx
                    # Print the row for manual inspection
                    break
        
        result = {
            'oil_col': oil_col,
            'water_col': water_col,
            'gas_col': gas_col,
            'header_row_0based': found_row,
            'header_row_1based': found_row + 1 if found_row is not None else None
        }
        
        # Print header row and a few data rows for verification
        if found_row is not None:
            print(f"\n  Header row {found_row + 1} (1-based):")
            header_vals = df.iloc[found_row].tolist()
            for i, val in enumerate(header_vals):
                if val and not pd.isna(val):
                    print(f"    Col {i}: {val}")
            
            # Print first data row
            if found_row + 1 < len(df):
                print(f"\n  First data row {found_row + 2}:")
                data_vals = df.iloc[found_row + 1].tolist()
                relevant_cols = [i for i in range(len(data_vals)) if i in [oil_col, water_col, gas_col] or (i < 10)]
                for i in relevant_cols[:20]:  # Limit to first 20 columns
                    if data_vals[i] and not pd.isna(data_vals[i]):
                        print(f"    Col {i}: {data_vals[i]}")
        
        return result, None
        
    except Exception as e:
        return None, str(e)

def main():
    sheets_dir = Path('sheets')
    
    print("=" * 80)
    print("PRODUCTION COLUMN DISCOVERY")
    print("=" * 80)
    
    for battery in BATTERIES:
        print(f"\n{'='*80}")
        print(f"Battery: {battery['name']}")
        print(f"File: {battery['file']}")
        print(f"Sheet: {battery['sheet']}")
        print(f"{'='*80}")
        
        file_path = sheets_dir / battery['file']
        result, error = find_production_columns(
            file_path, 
            battery['sheet'], 
            battery.get('header_row')
        )
        
        if error:
            print(f"ERROR: {error}")
        elif result:
            print(f"\nRESULTS:")
            print(f"  Oil Production Column: {result['oil_col']}")
            print(f"  Water Production Column: {result['water_col']}")
            print(f"  Gas Production Column: {result['gas_col']}")
            print(f"  Header Row (1-based): {result['header_row_1based']}")
            
            if result['oil_col'] is None and result['water_col'] is None and result['gas_col'] is None:
                print(f"\n  NOTE: No production columns found automatically.")
                print(f"  This battery may not have battery-level production data,")
                print(f"  or the columns may be named differently.")

if __name__ == "__main__":
    main()
