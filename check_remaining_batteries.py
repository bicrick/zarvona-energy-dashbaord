#!/usr/bin/env python3
"""
Check the remaining batteries for production columns.
"""

from pathlib import Path
import pandas as pd
import openpyxl

def list_sheets(file_path):
    """List all sheets in an Excel file."""
    try:
        wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
        return wb.sheetnames
    except Exception as e:
        return f"ERROR: {e}"

def examine_sheet(file_path, sheet_name, max_rows=15, max_cols=60):
    """Examine a sheet to look for production data."""
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
        print(f"\n  Sheet: {sheet_name}")
        print(f"  Dimensions: {len(df)} rows x {len(df.columns)} columns")
        
        # Look for production-related headers in first 15 rows
        found_prod = False
        for row_idx in range(min(max_rows, len(df))):
            row_values = [str(v).lower() if v and not pd.isna(v) else "" for v in df.iloc[row_idx].tolist()]
            row_str = ' '.join(row_values)
            
            if ('oil' in row_str and 'prod' in row_str) or \
               ('water' in row_str and 'prod' in row_str) or \
               ('gas' in row_str and 'prod' in row_str):
                print(f"\n  Row {row_idx + 1} (possible production headers):")
                for col_idx in range(min(max_cols, len(df.columns))):
                    val = df.iloc[row_idx, col_idx]
                    if val and not pd.isna(val):
                        val_str = str(val).strip()
                        if val_str:
                            print(f"    Col {col_idx}: {val_str}")
                found_prod = True
                break
        
        if not found_prod:
            print(f"  No obvious production columns found in first {max_rows} rows")
        
    except Exception as e:
        print(f"  ERROR: {e}")

def main():
    sheets_dir = Path('sheets')
    
    batteries = [
        ('Big Max', 'Big Max Gauge Sheet.xlsx'),
        ('Big Max 1H', 'Big Max 1H Gauge Sheet.xlsx'),
        ('Polaris', 'Polaris Gauge Sheet.xlsx'),
        ('Shusa', 'Shusa Gauge Sheet.xlsx'),
        ('MW-Wemac-Sabrina-Berkley', 'Mw-Wemac-Sabrina-Berkley.xlsx'),
    ]
    
    for name, filename in batteries:
        print(f"\n{'='*80}")
        print(f"Battery: {name}")
        print(f"File: {filename}")
        print(f"{'='*80}")
        
        file_path = sheets_dir / filename
        if not file_path.exists():
            print(f"  ERROR: File not found")
            continue
        
        sheets = list_sheets(file_path)
        if isinstance(sheets, str):
            print(sheets)
            continue
        
        print(f"\nAvailable sheets: {', '.join(sheets)}")
        
        # Check likely main gauge sheets
        main_sheet_candidates = [s for s in sheets if 
                                 'total' in s.lower() or 
                                 'gauge' in s.lower() or
                                 name.lower().replace(' ', '') in s.lower().replace(' ', '')]
        
        if not main_sheet_candidates:
            # Try first non-test sheet
            main_sheet_candidates = [s for s in sheets if 
                                     'test' not in s.lower() and 
                                     'ticket' not in s.lower() and
                                     'chem' not in s.lower()]
        
        print(f"\nChecking candidate main gauge sheets: {main_sheet_candidates[:3]}")
        
        for sheet in main_sheet_candidates[:3]:
            examine_sheet(file_path, sheet)

if __name__ == "__main__":
    main()
