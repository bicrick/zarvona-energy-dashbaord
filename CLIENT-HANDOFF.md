# Zarvona Energy Dashboard - Client Handoff

## Project Information

- **Firebase Project ID:** zarvona-energy-a85ce
- **Project Name:** zarvona-energy
- **Project Number:** 171021980471
- **Firebase Console:** https://console.firebase.google.com/project/zarvona-energy-a85ce
- **Google Cloud Console:** https://console.cloud.google.com/home/dashboard?project=zarvona-energy-a85ce
- **Live URL:** https://zarvona-energy-a85ce.web.app (or custom domain if configured)

## Billing Plan

- **Plan:** Blaze (Pay-as-you-go)
- **Billing Console:** https://console.cloud.google.com/billing?project=zarvona-energy-a85ce

### Expected Monthly Costs

Based on current usage patterns:
- **Firestore:** ~$X/month (estimate based on your usage)
- **Firebase Hosting:** ~$X/month
- **Firebase Authentication:** Free (under 50K monthly active users)
- **Cloud Storage:** ~$X/month

**Total Estimated:** ~$X-Y/month

Note: Costs vary based on:
- Number of gauge sheets uploaded
- Number of users accessing the dashboard
- Data storage size
- Number of database reads/writes

## Services Enabled

- Firebase Hosting
- Cloud Firestore
- Firebase Authentication (Email/Password + Microsoft OAuth)
- Cloud Storage for Firebase

## Access & Permissions

### Your Access (Client)
- **Role:** Owner
- **Permissions:** Full control over project, billing, and settings

### Developer Access (Patrick)
- **Role:** Editor
- **Permissions:** Can deploy code updates, modify database, view analytics
- **Cannot:** Change billing, delete project, modify IAM permissions

## Monitoring & Costs

### View Current Costs
1. Go to: https://console.cloud.google.com/billing?project=zarvona-energy-a85ce
2. Click on your billing account
3. View "Reports" tab for detailed breakdown

### Set Budget Alerts
1. Go to: https://console.cloud.google.com/billing/budgets?project=zarvona-energy-a85ce
2. Click "Create Budget"
3. Set monthly budget threshold
4. Add email alerts at 50%, 90%, 100%

### View Usage Statistics
- Firebase Console > Usage and billing
- See Firestore reads/writes, storage, hosting bandwidth

## Support & Maintenance

### Developer Contact
- **Name:** Patrick Brown
- **Email:** patrickbrownai@gmail.com

### For Technical Issues
Contact developer for:
- Application bugs or errors
- Feature requests
- Data issues
- User access problems

### For Billing Issues
Manage directly in Google Cloud Console:
- https://console.cloud.google.com/billing?project=zarvona-energy-a85ce
- Or contact Google Cloud Support

## Important Notes

1. **Do not delete the project** - This will permanently delete all data and the application
2. **Backup strategy** - Firestore data is automatically backed up by Google, but you may want to set up additional exports
3. **Security** - All security rules are configured in the Firebase Console under Firestore and Storage rules
4. **Users** - Firebase Authentication users can be managed in the Firebase Console

## Emergency Contacts

- **Google Cloud Support:** https://cloud.google.com/support
- **Firebase Support:** https://firebase.google.com/support
- **Developer:** patrickbrownai@gmail.com

---

Transfer completed: [DATE]
