# How to Shut Down the Zarvona Energy Dashboard

## Access Information

**Dashboard Login:**
- URL: https://zarvona-energy-dashboard.web.app
- Username: user@zarvonaenergy.com
- Password: wtxnorth

**Google Cloud/Firebase Console:**
- Use your owner account: jlmanzo708@gmail.com
- Access Firebase Console: https://console.firebase.google.com/project/zarvona-energy-a85ce
- Access Google Cloud Console: https://console.cloud.google.com/home/dashboard?project=zarvona-energy-a85ce

---

## Important: Read Before Proceeding

**Shutting down the project is PERMANENT and IRREVERSIBLE:**
- All data will be deleted (well data, production records, user accounts, etc.)
- The website will go offline immediately
- You cannot undo this action
- Billing will stop within 24-48 hours

## Option 1: Temporarily Disable (Recommended First Step)

If you're unsure or want to pause temporarily, disable the services first:

### Disable Firebase Hosting (Takes Site Offline)

1. Go to: https://console.firebase.google.com/project/zarvona-energy-a85ce/hosting
2. Click on your site
3. Click the three dots menu (⋮)
4. Select "Delete"
5. This removes the website but keeps your data

### Disable Authentication (Prevents Logins)

1. Go to: https://console.firebase.google.com/project/zarvona-energy-a85ce/authentication
2. Click "Sign-in method" tab
3. Disable all sign-in providers (Email/Password, Microsoft)

**Cost after disabling:** Near $0/month (only minimal storage fees)

---

## Option 2: Complete Project Deletion (Permanent)

### Before You Delete - BACKUP YOUR DATA

**Export Firestore Data:**

1. Go to: https://console.cloud.google.com/firestore/databases/-default-/import-export?project=zarvona-energy-a85ce
2. Click "Export"
3. Select "All collections"
4. Choose a Cloud Storage bucket or create a new one
5. Click "Export" and wait for completion
6. Download the exported data to your local computer

**Export User List:**

1. Go to: https://console.firebase.google.com/project/zarvona-energy-a85ce/authentication/users
2. Click "Export users" (top right)
3. Save the CSV file

### Delete the Firebase Project

**Method 1: Via Firebase Console (Easier)**

1. Go to: https://console.firebase.google.com/project/zarvona-energy-a85ce/settings/general
2. Scroll to bottom of page
3. Click "Delete project"
4. Read the warnings carefully
5. Type the project ID: `zarvona-energy-a85ce`
6. Click "Delete project"

**Method 2: Via Google Cloud Console**

1. Go to: https://console.cloud.google.com/home/dashboard?project=zarvona-energy-a85ce
2. Click hamburger menu (☰) > "IAM & Admin" > "Settings"
3. Click "Shut down"
4. Type the project ID: `zarvona-energy-a85ce`
5. Click "Shut down"

### After Deletion

**Verify Billing Has Stopped:**

1. Wait 24-48 hours
2. Go to: https://console.cloud.google.com/billing
3. Click your billing account
4. Click "Reports" tab
5. Filter by project: "zarvona-energy" should show $0 after deletion date

**What Happens:**
- Website goes offline immediately
- All databases and storage deleted within minutes
- Final bill generated within 1-2 billing cycles
- Project ID `zarvona-energy-a85ce` released after 30 days

---

## Option 3: Transfer Back to Developer

If you want to stop paying but keep the project available:

1. Contact developer (Patrick): patrickbrownai@gmail.com
2. Developer can take back ownership and billing responsibility
3. You can be removed as an owner

---

## Expected Final Costs

After shutting down, you'll receive one final bill covering:
- Usage from last bill date through shutdown date
- Typically ranges from $0-50 depending on usage
- Paid automatically from your billing account

---

## Troubleshooting

**"I can't find the delete button"**
- Make sure you're logged in as: jlmanzo708@gmail.com
- Verify you have "Owner" role in the project
- Try using Method 2 (Google Cloud Console) instead

**"I get an error when trying to delete"**
- Check if there are any billing issues
- Verify you're the project owner
- Contact Google Cloud Support

**"I want to keep some data"**
- Export data BEFORE deleting (see backup section above)
- Save exports to your local computer
- Consider keeping project in disabled state instead

---

## Need Help?

**Before Shutting Down:**
- Contact developer: patrickbrownai@gmail.com
- Get a final data export if needed

**After Shutting Down:**
- Google Cloud Support: https://cloud.google.com/support
- Check billing console to verify charges stopped

---

## Summary Checklist

Before deleting the project:

- [ ] Export all Firestore data
- [ ] Export user list
- [ ] Save exported data to your computer
- [ ] Verify you no longer need the dashboard
- [ ] Confirm all stakeholders are aware
- [ ] Note final billing date

To delete:

- [ ] Go to Firebase Console Settings
- [ ] Click "Delete project"
- [ ] Type project ID: `zarvona-energy-a85ce`
- [ ] Confirm deletion
- [ ] Verify billing stops after 24-48 hours

---

**Project Details:**
- Project ID: `zarvona-energy-a85ce`
- Project Name: `zarvona-energy`
- Current Owner: `jlmanzo708@gmail.com`
- Developer: `patrickbrownai@gmail.com`
