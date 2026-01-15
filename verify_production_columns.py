#!/usr/bin/env python3
"""
Verify specific production column positions by examining headers and context.
"""

from pathlib import Path
import pandas as pd

def examine_columns(file_path, sheet_name, header_row_1based, col_range):
    """Examine specific columns around the suspected production area."""
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
        header_idx = header_row_1based - 1
        
        print(f"\nRows {header_row_1based-2} to {header_row_1based+2}:")
        for row_offset in range(-2, 3):
            row_idx = header_idx + row_offset
            if 0 <= row_idx < len(df):
                print(f"\n  Row {row_idx + 1} (1-based):")
                for col in col_range:
                    val = df.iloc[row_idx, col]
                    if val and not pd.isna(val):
                        print(f"    Col {col}: {val}")
    except Exception as e:
        print(f"ERROR: {e}")

def main():
    sheets_dir = Path('sheets')
    
    print("="*80)
    print("VERIFYING PRODUCTION COLUMNS")
    print("="*80)
    
    # Based on the discovery output, let's verify these positions
    configs = [
        {
            'name': 'Cowden',
            'file': 'Cowden Gauge Sheet1.xlsx',
            'sheet': 'Cowden',
            'header_row': 7,
            'suspected_cols': range(24, 27)  # Cols 24, 25, 26: OIL, WATER, GAS
        },
        {
            'name': 'South Andrews (36-4H)',
            'file': 'South Andrews Gauge Sheet.xlsm',
            'sheet': '36-4H',
            'header_row': 9,
            'suspected_cols': range(56, 59)  # Cols 56, 57, 58: OIL, WATER, FORMATION GAS
        },
        {
            'name': 'South Andrews (37-6H)',
            'file': 'South Andrews Gauge Sheet.xlsm',
            'sheet': '37-6H',
            'header_row': 9,
            'suspected_cols': range(29, 32)  # Cols 29, 30, 31: OIL, WATER, FORMATION GAS
        },
        {
            'name': 'Unit 1-30',
            'file': '1-30 Unit 1H Gauge Sheet.xlsx',
            'sheet': '1-30-1H Gauge Sheet',
            'header_row': 6,
            'suspected_cols': range(30, 33)  # Cols 30, 31, 32: OIL, WATER, FORMATION GAS
        },
        {
            'name': 'ULS 3-5H',
            'file': 'ULS 3-5H Gauge Sheet.xlsx',
            'sheet': 'University 3-5H',
            'header_row': 4,
            'suspected_cols': range(30, 33)  # Cols 30, 31, 32: PROD (need to verify which is which)
        },
    ]
    
    for config in configs:
        print(f"\n{'='*80}")
        print(f"Battery: {config['name']}")
        print(f"{'='*80}")
        file_path = sheets_dir / config['file']
        examine_columns(
            file_path,
            config['sheet'],
            config['header_row'],
            config['suspected_cols']
        )

if __name__ == "__main__":
    main()
