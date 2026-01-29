# Zarvona Energy Dashboard - Getting Started Guide

## What is This?

The Zarvona Energy Dashboard is a web-based application that tracks and visualizes your oil well operations. It provides real-time insights into production, well performance, and equipment metrics across all your well sites.

### Key Features

- **Production Tracking** - Monitor daily oil, water, and gas production
- **Well Performance** - View trends, efficiency metrics, and pump performance
- **Chemical Management** - Track chemical programs and treatment schedules
- **Failure History** - Document and review equipment failures
- **Action Items** - Manage maintenance tasks and operations
- **Aggregate Analytics** - Compare performance across wells and batteries
- **Data Import** - Upload Excel gauge sheets to automatically populate data

---

## Access Information

### Dashboard Login

**URL:** https://zarvona-energy-dashboard.web.app

**Login Credentials:**
- Username: `user@zarvonaenergy.com`
- Password: `wtxnorth`

### Google Cloud Console (Project Management)

**Owner Account:** `jlmanzo708@gmail.com`

**Firebase Console:** https://console.firebase.google.com/project/zarvona-energy-a85ce

**Google Cloud Console:** https://console.cloud.google.com/home/dashboard?project=zarvona-energy-a85ce

**Billing Dashboard:** https://console.cloud.google.com/billing?project=zarvona-energy-a85ce

---

## Getting Started

### Step 1: Log In

1. Go to: https://zarvona-energy-dashboard.web.app
2. Enter the credentials:
   - Email: `user@zarvonaenergy.com`
   - Password: `wtxnorth`
3. Click "Sign In"

### Step 2: Upload Gauge Sheets

The dashboard requires Excel gauge sheet files to populate production data.

1. Click the **"Getting Started"** tab (or **"Upload"** icon)
2. Upload all required Excel files at once by:
   - Clicking "Upload All Gauge Sheets" and selecting files
   - Or dragging and dropping all files into the upload area
3. Wait for processing to complete (usually 30-60 seconds)

**Required Files:**
- Cowden Gauge Sheet1.xlsx
- Big Max Gauge Sheet.xlsx
- Big Max 1H Gauge Sheet.xlsx
- South Andrews Gauge Sheet.xlsm
- Polaris Gauge Sheet.xlsx
- Shusa Gauge Sheet.xlsx
- Mw-Wemac-Sabrina-Berkley.xlsx
- 1-30 Unit 1H Gauge Sheet.xlsx
- ULS 3-5H Gauge Sheet.xlsx
- Master Chemical Sheet.xlsx
- West Texas Fluid Level Sheet.xlsx

### Step 3: View Your Data

Once uploaded, the dashboard will display:

**Operations Dashboard:**
- Overview of all wells
- Total daily production (oil, water, gas)
- Top producing wells
- Action items requiring attention

**Individual Well Views:**
- Production history and trends
- Well test data
- Pressure readings
- Pump efficiency metrics
- Chemical programs
- Failure history

**Aggregate Views:**
- Oil, water, and gas production charts
- Cross-well comparisons
- Battery-level analytics

---

## Basic Navigation

### Main Menu (Left Sidebar)

1. **Operations Dashboard** - Overview of all operations
2. **Gauge Sheet** - Upload and manage individual gauge sheets
3. **Well View** - Detailed view of individual wells
4. **Battery View** - Performance by battery
5. **Oil Production** - Aggregate oil production charts
6. **Water Production** - Aggregate water production charts
7. **Gas Production** - Aggregate gas production charts
8. **Master Chemical Sheet** - Chemical programs for all wells
9. **Fluid Levels** - Downhole fluid level tracking
10. **Aries** - Well production forecasts and comparisons

### Switching Between Wells

- Use the **well selector dropdown** in the header
- Or click on a well name from the Operations Dashboard

### Date Ranges

Most charts and tables allow you to filter by date:
- Click the "From" and "To" date fields
- Select your desired date range
- Click "Reset" to return to default view

### Exporting Data

- Click **"Export CSV"** button on any table
- Opens/downloads a CSV file you can use in Excel

---

## Common Tasks

### Re-Upload Updated Gauge Sheets

1. Go to **"Operations Dashboard"**
2. Click **"Re-upload Sheets"** button
3. Select and upload your updated Excel files
4. Data will automatically update

### Add Action Items

1. Navigate to a specific well view
2. Scroll to **"Action Items"** section
3. Click **"Add Action Item"**
4. Enter description and priority
5. Click "Save"

### Track Failures

1. Navigate to a specific well view
2. Scroll to **"Failure History"** section
3. Click **"Add Failure"** or the + icon
4. Enter failure date, upload Excel file, add notes
5. Click "Add Entry"

### Edit Chemical Programs

1. Go to **"Master Chemical Sheet"** view
2. Click **"Edit"** button
3. Click any cell to edit values
4. Changes are highlighted in yellow
5. Click **"Save All Changes"** when done

### View Production Trends

1. Go to **"Oil Production"**, **"Water Production"**, or **"Gas Production"**
2. Use date range to filter data
3. Aggregate by Day, Week, or Month
4. Filter specific batteries using the checkboxes
5. Hover over chart points to see exact values

---

## Important Information

### Data Updates

- Data is pulled from uploaded Excel gauge sheets
- Re-upload sheets weekly or as needed to keep data current
- Manual edits (action items, notes) are preserved between uploads

### User Management

Currently configured with a single shared login. If you need individual user accounts:
- Contact developer (Patrick) to set up additional users
- Individual accounts can be created with @zarvonaenergy.com email addresses

### Browser Compatibility

Works best with:
- Google Chrome (recommended)
- Microsoft Edge
- Firefox
- Safari

### Mobile Access

The dashboard is accessible on mobile devices but is optimized for desktop viewing.

---

## Billing & Costs

### Current Status

- You own the Firebase project
- Your billing account pays for all charges
- Billing account: linked to `jlmanzo708@gmail.com`
- Plan: Blaze (pay-as-you-go)

### Expected Costs

Monthly costs typically range from **$5-50** depending on:
- Number of gauge sheets uploaded
- Number of active users
- Data storage size
- Number of database operations

### Monitor Costs

View current charges:
https://console.cloud.google.com/billing?project=zarvona-energy-a85ce

### Set Budget Alerts (Recommended)

1. Go to: https://console.cloud.google.com/billing/budgets?project=zarvona-energy-a85ce
2. Click "Create Budget"
3. Set monthly budget (e.g., $50)
4. Add email alerts at 50%, 90%, 100%
5. You'll receive notifications if costs exceed thresholds

---

## Support & Troubleshooting

### Technical Issues

**Contact Developer:**
- Name: Patrick Brown
- Email: patrickbrownai@gmail.com

**Common Issues:**
- **Can't log in:** Verify email/password, check for typos
- **Upload fails:** Ensure files are in Excel format (.xlsx, .xls)
- **Missing data:** Verify correct files were uploaded
- **Charts not loading:** Try refreshing the page or clearing browser cache

### Billing Questions

Manage billing directly in Google Cloud Console:
- https://console.cloud.google.com/billing?project=zarvona-energy-a85ce
- Or contact Google Cloud Support

### Password Reset

Currently using a shared account. To reset password:
- Click "Forgot password?" on login screen
- Or contact developer for assistance

---

## Security Best Practices

1. **Don't share login credentials** outside your organization
2. **Log out** when using shared computers
3. **Regular backups** - Export important data periodically
4. **Monitor access** - Check Firebase Console for unusual activity
5. **Budget alerts** - Set up billing alerts to catch unexpected usage

---

## Next Steps

1. Log in and familiarize yourself with the interface
2. Upload your current gauge sheets
3. Set up budget alerts in Google Cloud Console
4. Bookmark the dashboard URL for easy access
5. Contact Patrick if you need any customizations or have questions

---

## Quick Reference

| Item | Details |
|------|---------|
| **Dashboard URL** | https://zarvona-energy-dashboard.web.app |
| **Username** | user@zarvonaenergy.com |
| **Password** | wtxnorth |
| **Owner Account** | jlmanzo708@gmail.com |
| **Project ID** | zarvona-energy-a85ce |
| **Developer** | Patrick Brown (patrickbrownai@gmail.com) |
| **Billing Console** | https://console.cloud.google.com/billing?project=zarvona-energy-a85ce |

---

## Additional Resources

**Shutdown Instructions:** See separate document (SHUTDOWN-INSTRUCTIONS.pdf) for how to shut down the project when no longer needed.

**Firebase Documentation:** https://firebase.google.com/docs

**Google Cloud Support:** https://cloud.google.com/support

---

Welcome to the Zarvona Energy Dashboard! If you have any questions or need assistance, don't hesitate to reach out.

**Patrick Brown**  
patrickbrownai@gmail.com
