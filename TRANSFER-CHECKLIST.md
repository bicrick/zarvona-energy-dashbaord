# Firebase Project Transfer Checklist

Use this checklist to ensure a smooth transfer to your client.

## Pre-Transfer (You)

- [x] Configuration backed up to JSON files
- [ ] Estimate current monthly costs
- [ ] Document any custom configurations
- [ ] Send initial email to client with setup instructions

## Client Setup (Client)

- [ ] Client creates Google Cloud account
- [ ] Client sets up billing account
- [ ] Client confirms billing account is active
- [ ] Client provides email address to you

## Execute Transfer (You)

```bash
# Set client email
export CLIENT_EMAIL="client@example.com"
```

- [ ] Add client as owner:
```bash
gcloud projects add-iam-policy-binding zarvona-energy-a85ce \
  --member="user:${CLIENT_EMAIL}" \
  --role="roles/owner"
```

- [ ] Verify client can see project in Firebase Console

- [ ] Client links their billing account (either via console or CLI)

- [ ] Verify billing switch:
```bash
gcloud beta billing projects describe zarvona-energy-a85ce
```

- [ ] Change your role from Owner to Editor:
```bash
gcloud projects remove-iam-policy-binding zarvona-energy-a85ce \
  --member="user:patrickbrownai@gmail.com" \
  --role="roles/owner"

gcloud projects add-iam-policy-binding zarvona-energy-a85ce \
  --member="user:patrickbrownai@gmail.com" \
  --role="roles/editor"
```

## Post-Transfer Verification (You)

- [ ] Verify your access level:
```bash
gcloud projects get-iam-policy zarvona-energy-a85ce \
  --flatten="bindings[].members" \
  --filter="bindings.members:patrickbrownai@gmail.com"
```

- [ ] Test deployment still works:
```bash
firebase login --reauth
firebase deploy --only hosting --project zarvona-energy-a85ce
```

- [ ] Verify you can access Firebase Console (read/write)

## Post-Transfer Verification (Client)

- [ ] Client sees project in Firebase Console
- [ ] Client listed as Owner in IAM
- [ ] Client's billing account is linked
- [ ] Client can view current charges
- [ ] Client sets up budget alerts (recommended)

## Final Steps

- [ ] Send CLIENT-HANDOFF.md to client
- [ ] Walk through billing console with client (optional)
- [ ] Confirm ongoing support arrangement
- [ ] Document transfer completion date

## Emergency Rollback

If something goes wrong, you can rollback using the backup files:

```bash
# Restore IAM policies
gcloud projects set-iam-policy zarvona-energy-a85ce iam-policy-backup.json

# Re-link your billing
gcloud beta billing projects link zarvona-energy-a85ce \
  --billing-account=01EFDF-6F00F9-A0EC03
```

## Notes

- Transfer typically takes 15-30 minutes
- Billing changes can take up to 24 hours to fully propagate
- No downtime for users during transfer
- All data remains intact
