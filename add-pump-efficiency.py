#!/usr/bin/env python3
"""
One-time script to add pump efficiency data to wells in Firestore.
Run once, then can be deleted after verification.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import re

# Pump efficiency data - hardcoded from user's table
PUMP_EFFICIENCY_DATA = {
    "Shusa 14-1": {"strokeLength": 77, "spm": 6.9, "runTime": 40, "pumpSize": 1.25, "theoreticalBFPD": 39},
    "Shusa 14-10": {"strokeLength": 86, "spm": 5.9, "runTime": 30, "pumpSize": 1.25, "theoreticalBFPD": 28},
    "Shusa 14-12": {"strokeLength": 86, "spm": 10.6, "runTime": 30, "pumpSize": 1.5, "theoreticalBFPD": 72},
    "Shusa 14-2": {"strokeLength": 86, "spm": 6.5, "runTime": 100, "pumpSize": 1.5, "theoreticalBFPD": 147},
    "Shusa 14-3": {"strokeLength": 168, "spm": 9.6, "runTime": 100, "pumpSize": 2, "theoreticalBFPD": 752},
    "Shusa 14-4": {"strokeLength": 68, "spm": 6, "runTime": 65, "pumpSize": 1.5, "theoreticalBFPD": 70},
    "Shusa 14-5": {"strokeLength": 86, "spm": 9, "runTime": 45, "pumpSize": 1.25, "theoreticalBFPD": 63},
    "Shusa 14-6": {"strokeLength": 86, "spm": 11.5, "runTime": 40, "pumpSize": 1.5, "theoreticalBFPD": 104},
    "Shusa 14-7": {"strokeLength": 102, "spm": 6, "runTime": 100, "pumpSize": 1.5, "theoreticalBFPD": 160},
    "Shusa 14-8": {"strokeLength": 86, "spm": 8.7, "runTime": 25, "pumpSize": 1.5, "theoreticalBFPD": 49},
    "Shusa 14-9": {"strokeLength": 100, "spm": 8.2, "runTime": 40, "pumpSize": 1.5, "theoreticalBFPD": 86},
    "Shusa 15-1": {"strokeLength": 86, "spm": 7, "runTime": 60, "pumpSize": 2, "theoreticalBFPD": 168},
    "Shusa 15-10": {"strokeLength": 100, "spm": 5.3, "runTime": 45, "pumpSize": 1.5, "theoreticalBFPD": 63},
    "Shusa 15-11": {"strokeLength": 86, "spm": 5.9, "runTime": 20, "pumpSize": 1.5, "theoreticalBFPD": 27},
    "Shusa 15-12": {"strokeLength": 86, "spm": 7.1, "runTime": 45, "pumpSize": 1.5, "theoreticalBFPD": 72},
    "Shusa 15-13": {"strokeLength": 168, "spm": 8.1, "runTime": 100, "pumpSize": 2, "theoreticalBFPD": 634},
    "Shusa 15-14": {"strokeLength": 86, "spm": 6.9, "runTime": 40, "pumpSize": 1.5, "theoreticalBFPD": 62},
    "Shusa 15-15": {"strokeLength": 120, "spm": 7.3, "runTime": 45, "pumpSize": 1.063, "theoreticalBFPD": 52},
    "Shusa 15-16": {"strokeLength": 86, "spm": 5.2, "runTime": 40, "pumpSize": 1.5, "theoreticalBFPD": 47},
    "Shusa 15-17": {"strokeLength": 145, "spm": 7, "runTime": 50, "pumpSize": 2, "theoreticalBFPD": 236},
    "Shusa 15-2": {"strokeLength": 86, "spm": 5.9, "runTime": 40, "pumpSize": 1.5, "theoreticalBFPD": 53},
    "Shusa 15-3": {"strokeLength": 86, "spm": 5.9, "runTime": 40, "pumpSize": 1.5, "theoreticalBFPD": 53},
    "Shusa 15-4": {"strokeLength": 64, "spm": 7.2, "runTime": 50, "pumpSize": 1.25, "theoreticalBFPD": 42},
    "Shusa 15-6": {"strokeLength": 100, "spm": 7, "runTime": 75, "pumpSize": 1.25, "theoreticalBFPD": 96},
    "Shusa 15-7": {"strokeLength": 100, "spm": 7.3, "runTime": 60, "pumpSize": 1.25, "theoreticalBFPD": 80},
    "Shusa 15-8": {"strokeLength": 86, "spm": 5.1, "runTime": 65, "pumpSize": 1.25, "theoreticalBFPD": 52},
    "Shusa 15-9": {"strokeLength": 120, "spm": 6.6, "runTime": 80, "pumpSize": 1.75, "theoreticalBFPD": 226},
    "Link 2": {"strokeLength": 120, "spm": 7, "runTime": 75, "pumpSize": 1.5, "theoreticalBFPD": 165},
    "Link 3": {"strokeLength": 102, "spm": 6.6, "runTime": 35, "pumpSize": 1.25, "theoreticalBFPD": 43},
    "Link 4": {"strokeLength": 100, "spm": 8, "runTime": 55, "pumpSize": 1.75, "theoreticalBFPD": 157},
    "Link 5": {"strokeLength": 74, "spm": 5, "runTime": 80, "pumpSize": 1.5, "theoreticalBFPD": 78},
    "Link 6": {"strokeLength": 86, "spm": 8.2, "runTime": 25, "pumpSize": 1.25, "theoreticalBFPD": 32},
    "Rosebud 1": {"strokeLength": 60, "spm": 7.4, "runTime": 40, "pumpSize": 1.063, "theoreticalBFPD": 23},
    "Rosebud 3": {"strokeLength": 120, "spm": 7.3, "runTime": 40, "pumpSize": 1.25, "theoreticalBFPD": 64},
    "Rosebud 4": {"strokeLength": 86, "spm": 5, "runTime": 50, "pumpSize": 1.5, "theoreticalBFPD": 56},
    "Shusa 20-1": {"strokeLength": 100, "spm": 7, "runTime": 25, "pumpSize": 1.25, "theoreticalBFPD": 32},
    "Shusa 20-2": {"strokeLength": 86, "spm": 7.3, "runTime": 20, "pumpSize": 1.5, "theoreticalBFPD": 33},
    "Shusa 20-3": {"strokeLength": 86, "spm": 5.9, "runTime": 35, "pumpSize": 1.5, "theoreticalBFPD": 47},
    "Shusa 20-4": {"strokeLength": 86, "spm": 5.6, "runTime": 70, "pumpSize": 1.5, "theoreticalBFPD": 88},
    "Shusa 20-5": {"strokeLength": 86, "spm": 7.5, "runTime": 30, "pumpSize": 1.25, "theoreticalBFPD": 35},
    "Polaris 1": {"strokeLength": 144, "spm": 7.5, "runTime": 100, "pumpSize": 1.5, "theoreticalBFPD": 283},
    "1-3-1H": {"strokeLength": 113, "spm": 7, "runTime": 77, "pumpSize": 1.25, "theoreticalBFPD": 111},
    "1-3-3H": {"strokeLength": 106, "spm": 6.1, "runTime": 50, "pumpSize": 1.25, "theoreticalBFPD": 59},
    "36-1H": {"strokeLength": 124, "spm": 5.6, "runTime": 80, "pumpSize": 1.25, "theoreticalBFPD": 101},
    "36-2H": {"strokeLength": 144, "spm": 5.2, "runTime": 50, "pumpSize": 1.25, "theoreticalBFPD": 68},
    "36-3H": {"strokeLength": 144, "spm": 5, "runTime": 50, "pumpSize": 1.25, "theoreticalBFPD": 66},
    "Pinn 1": {"strokeLength": 144, "spm": 6.2, "runTime": 100, "pumpSize": 1.25, "theoreticalBFPD": 163},
    "Pinn 2H": {"strokeLength": 168, "spm": 7.4, "runTime": 75, "pumpSize": 1.5, "theoreticalBFPD": 244},
    "FN 3731": {"strokeLength": 122, "spm": 6, "runTime": 30, "pumpSize": 1.25, "theoreticalBFPD": 40},
    "Saw 5H": {"strokeLength": 168, "spm": 7.1, "runTime": 100, "pumpSize": 1.25, "theoreticalBFPD": 217},
    "Cobra 3012": {"strokeLength": 120, "spm": 7.1, "runTime": 20, "pumpSize": 1.25, "theoreticalBFPD": 31},
    "Cobra 3033": {"strokeLength": 102, "spm": 6.6, "runTime": 50, "pumpSize": 1.25, "theoreticalBFPD": 61},
    "Cobra 5H": {"strokeLength": 193, "spm": 6.3, "runTime": 60, "pumpSize": 1.5, "theoreticalBFPD": 191},
    "Berkley 1": {"strokeLength": 120, "spm": 6.9, "runTime": 100, "pumpSize": 1.25, "theoreticalBFPD": 151},
    "Berkley 5": {"strokeLength": 144, "spm": 5.3, "runTime": 75, "pumpSize": 1.25, "theoreticalBFPD": 104},
    "Berkley 6": {"strokeLength": 144, "spm": 5.3, "runTime": 50, "pumpSize": 1.25, "theoreticalBFPD": 69},
    "Cowden 602H": {"strokeLength": 168, "spm": 6, "runTime": 100, "pumpSize": 1.063, "theoreticalBFPD": 133},
    "M&W 1R": {"strokeLength": 106, "spm": 9.8, "runTime": 100, "pumpSize": 1.5, "theoreticalBFPD": 272},
    "Mc-Miles 1": {"strokeLength": 120, "spm": 6.3, "runTime": 40, "pumpSize": 1.25, "theoreticalBFPD": 55},
    "Wemac 6": {"strokeLength": 102, "spm": 7, "runTime": 100, "pumpSize": 1.25, "theoreticalBFPD": 130},
    "Jane 2": {"strokeLength": 100, "spm": 7.2, "runTime": 60, "pumpSize": 1.25, "theoreticalBFPD": 79},
    "Big Max 1-1": {"strokeLength": 102, "spm": 7.5, "runTime": 40, "pumpSize": 1.25, "theoreticalBFPD": 56},
    "Big Max 11-1": {"strokeLength": 288, "spm": 1.75, "runTime": 100, "pumpSize": 1.75, "theoreticalBFPD": 180},
    "Big Max 11-2": {"strokeLength": 124, "spm": 6.5, "runTime": 70, "pumpSize": 1.75, "theoreticalBFPD": 201},
    "Big Max 1-1H": {"strokeLength": 168, "spm": 5, "runTime": 100, "pumpSize": 1.063, "theoreticalBFPD": 111},
    "Big Max 12-1": {"strokeLength": 145, "spm": 7, "runTime": 70, "pumpSize": 1.5, "theoreticalBFPD": 186},
    "Big Max 12-2": {"strokeLength": 145, "spm": 6, "runTime": 75, "pumpSize": 1.25, "theoreticalBFPD": 119},
    "Big Max 13-3": {"strokeLength": 124, "spm": 6.7, "runTime": 40, "pumpSize": 1.5, "theoreticalBFPD": 87},
    "Big Max 13-5": {"strokeLength": 100, "spm": 6.1, "runTime": 100, "pumpSize": 1.25, "theoreticalBFPD": 111},
    "Big Max 14-4": {"strokeLength": 145, "spm": 6.1, "runTime": 85, "pumpSize": 1.5, "theoreticalBFPD": 197},
    "Big Max 4-1": {"strokeLength": 145, "spm": 6.5, "runTime": 80, "pumpSize": 1.5, "theoreticalBFPD": 198},
    "Big Max 5-2": {"strokeLength": 145, "spm": 7.8, "runTime": 100, "pumpSize": 1.5, "theoreticalBFPD": 296},
}


def normalize_well_name(name):
    """Normalize well name for matching by removing special characters and lowercasing."""
    # Remove all special characters except dash and space, then lowercase
    normalized = re.sub(r'[^\w\s-]', '', name).lower()
    # Replace multiple spaces/dashes with single space
    normalized = re.sub(r'[\s-]+', ' ', normalized)
    return normalized.strip()


def create_name_variations(name):
    """Create common variations of a well name for matching."""
    variations = set()
    
    # Original normalized
    normalized = normalize_well_name(name)
    variations.add(normalized)
    
    # Without spaces
    variations.add(normalized.replace(' ', ''))
    
    # With dashes instead of spaces
    variations.add(normalized.replace(' ', '-'))
    
    # Handle number variations (e.g., "14-1" vs "14 #1" vs "14 1")
    # Replace patterns like "shusa 14 1" with "shusa 14-1"
    if ' ' in normalized:
        parts = normalized.split()
        if len(parts) >= 2:
            # Try combining last two parts with dash
            base = ' '.join(parts[:-2]) if len(parts) > 2 else parts[0]
            if len(parts) >= 2:
                last_two = f"{parts[-2]}-{parts[-1]}"
                if base:
                    variations.add(f"{base} {last_two}")
                else:
                    variations.add(last_two)
    
    return variations


def find_well_match(db_well_name, pump_data_names):
    """Find if a database well name matches any pump efficiency data well name."""
    db_variations = create_name_variations(db_well_name)
    
    for pump_name in pump_data_names:
        pump_variations = create_name_variations(pump_name)
        
        # Check for any overlapping variations
        if db_variations & pump_variations:
            return pump_name
    
    # Special case mappings for known mismatches (db_name -> pump_data_name)
    special_mappings = {
        'uls 1 3 1h': '1-3-1H',
        'uls 1 3 3h': '1-3-3H',
        '1 36 1h': '36-1H',
        '1 36 2h': '36-2H',
        '1 36 3h': '36-3H',
        'miles 1': 'Mc-Miles 1',
        'pinnacle 1': 'Pinn 1',
        'pinnacle 2h': 'Pinn 2H',
        'rosebud 20 1': 'Rosebud 1',
        'rosebud 20 3': 'Rosebud 3',
        'rosebud 20 4': 'Rosebud 4',
        'sawgrass 5h': 'Saw 5H',
    }
    
    db_normalized = normalize_well_name(db_well_name)
    if db_normalized in special_mappings:
        return special_mappings[db_normalized]
    
    return None


def main():
    print("=" * 60)
    print("Pump Efficiency Data Upload Script")
    print("=" * 60)
    print()
    
    # Initialize Firebase Admin SDK
    print("Initializing Firebase...")
    try:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'projectId': 'zarvona-energy-a85ce',
        })
        db = firestore.client()
        print("✓ Firebase initialized successfully")
        print()
    except Exception as e:
        print(f"✗ Error initializing Firebase: {e}")
        print("\nMake sure you've run: gcloud auth application-default login")
        return
    
    # Get all gauge sheets
    print("Fetching gauge sheets...")
    gauge_sheets = db.collection('gaugeSheets').stream()
    
    matched_wells = []
    unmatched_pump_data = set(PUMP_EFFICIENCY_DATA.keys())
    unmatched_db_wells = []
    
    # Iterate through all gauge sheets and their wells
    for sheet_doc in gauge_sheets:
        sheet_id = sheet_doc.id
        sheet_name = sheet_doc.to_dict().get('name', sheet_id)
        print(f"\nProcessing sheet: {sheet_name} ({sheet_id})")
        
        wells_ref = db.collection('gaugeSheets').document(sheet_id).collection('wells')
        wells = wells_ref.stream()
        
        for well_doc in wells:
            well_data = well_doc.to_dict()
            well_name = well_data.get('name', '')
            well_id = well_doc.id
            
            # Try to match this well with pump efficiency data
            matched_pump_name = find_well_match(well_name, PUMP_EFFICIENCY_DATA.keys())
            
            if matched_pump_name:
                pump_data = PUMP_EFFICIENCY_DATA[matched_pump_name]
                
                # Convert runTime from percentage to decimal
                run_time_decimal = pump_data['runTime'] / 100.0
                
                # Prepare pump efficiency object
                pump_efficiency = {
                    'strokeLength': pump_data['strokeLength'],
                    'spm': pump_data['spm'],
                    'runTime': run_time_decimal,
                    'pumpSize': pump_data['pumpSize'],
                    'theoreticalBFPD': pump_data['theoreticalBFPD'],
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                }
                
                # Update the well document
                well_ref = wells_ref.document(well_id)
                well_ref.update({'pumpEfficiency': pump_efficiency})
                
                matched_wells.append({
                    'sheet': sheet_name,
                    'wellName': well_name,
                    'matchedTo': matched_pump_name
                })
                
                # Remove from unmatched list
                unmatched_pump_data.discard(matched_pump_name)
                
                print(f"  ✓ {well_name} <- {matched_pump_name}")
            else:
                unmatched_db_wells.append({
                    'sheet': sheet_name,
                    'wellName': well_name
                })
    
    # Print summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\n✓ Successfully matched and updated: {len(matched_wells)} wells")
    
    if unmatched_pump_data:
        print(f"\n⚠ Unmatched pump efficiency data ({len(unmatched_pump_data)} wells):")
        for name in sorted(unmatched_pump_data):
            print(f"  - {name}")
    
    if unmatched_db_wells:
        print(f"\n⚠ Database wells without pump efficiency data ({len(unmatched_db_wells)} wells):")
        for well in unmatched_db_wells:
            print(f"  - {well['wellName']} ({well['sheet']})")
    
    print()
    print("=" * 60)
    print("Upload complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
