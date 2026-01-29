#!/bin/bash

# Firebase Project Transfer Script
# This script helps transfer the Firebase project to your client

set -e  # Exit on error

PROJECT_ID="zarvona-energy-a85ce"
YOUR_EMAIL="patrickbrownai@gmail.com"
YOUR_BILLING_ACCOUNT="01EFDF-6F00F9-A0EC03"

echo "=========================================="
echo "Firebase Project Transfer Script"
echo "Project: $PROJECT_ID"
echo "=========================================="
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "$YOUR_EMAIL"; then
    echo "ERROR: Not authenticated as $YOUR_EMAIL"
    echo "Run: gcloud auth login"
    exit 1
fi

echo "Step 1: Verify current project status"
echo "--------------------------------------"
gcloud projects describe $PROJECT_ID
echo ""

echo "Current IAM bindings:"
gcloud projects get-iam-policy $PROJECT_ID --format="table(bindings.role,bindings.members)"
echo ""

echo "Current billing account:"
gcloud beta billing projects describe $PROJECT_ID
echo ""

read -p "Does everything look correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 2: Get client information"
echo "--------------------------------------"
read -p "Enter client's email address: " CLIENT_EMAIL

if [[ -z "$CLIENT_EMAIL" ]]; then
    echo "ERROR: Client email is required"
    exit 1
fi

echo ""
echo "Client email: $CLIENT_EMAIL"
read -p "Is this correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 3: Add client as project owner"
echo "--------------------------------------"
echo "Adding $CLIENT_EMAIL as owner..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:${CLIENT_EMAIL}" \
  --role="roles/owner"

echo ""
echo "✓ Client added as owner"
echo ""

echo "Step 4: Verify client can access project"
echo "--------------------------------------"
echo "Ask your client to:"
echo "1. Go to: https://console.firebase.google.com/"
echo "2. Verify they can see 'zarvona-energy' in their projects"
echo "3. Click into the project"
echo ""
read -p "Has the client confirmed they can access the project? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Have the client verify access before continuing."
    echo "You can re-run this script to continue."
    exit 1
fi

echo ""
echo "Step 5: Link client's billing account"
echo "--------------------------------------"
echo ""
echo "Option A: Client does it themselves (RECOMMENDED)"
echo "  1. Client goes to: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
echo "  2. Client clicks 'Link a billing account'"
echo "  3. Client selects their billing account"
echo "  4. Client clicks 'Set account'"
echo ""
echo "Option B: You do it (requires client's billing account ID)"
echo ""
read -p "Which option? (A/B) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Bb]$ ]]; then
    read -p "Enter client's billing account ID (format: XXXXXX-XXXXXX-XXXXXX): " CLIENT_BILLING_ACCOUNT
    
    if [[ -z "$CLIENT_BILLING_ACCOUNT" ]]; then
        echo "ERROR: Billing account ID is required"
        exit 1
    fi
    
    echo "Linking billing account $CLIENT_BILLING_ACCOUNT..."
    gcloud beta billing projects link $PROJECT_ID \
      --billing-account=$CLIENT_BILLING_ACCOUNT
    
    echo "✓ Billing account linked"
else
    echo ""
    read -p "Has the client confirmed they've linked their billing account? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Have the client link their billing account before continuing."
        exit 1
    fi
fi

echo ""
echo "Step 6: Verify billing switch"
echo "--------------------------------------"
gcloud beta billing projects describe $PROJECT_ID
echo ""

read -p "Is the client's billing account now linked? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "ERROR: Billing account not properly linked"
    exit 1
fi

echo ""
echo "Step 7: Change your role to Editor"
echo "--------------------------------------"
echo "Removing your Owner role..."
gcloud projects remove-iam-policy-binding $PROJECT_ID \
  --member="user:${YOUR_EMAIL}" \
  --role="roles/owner"

echo "Adding you as Editor..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:${YOUR_EMAIL}" \
  --role="roles/editor"

echo "✓ Your role changed to Editor"
echo ""

echo "Step 8: Final verification"
echo "--------------------------------------"
echo "Your current access:"
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:${YOUR_EMAIL}" \
  --format="table(bindings.role)"

echo ""
echo "All project owners:"
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/owner" \
  --format="table(bindings.members)"

echo ""
echo "=========================================="
echo "✓ Transfer Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test deployment: firebase deploy --only hosting"
echo "2. Send CLIENT-HANDOFF.md to: $CLIENT_EMAIL"
echo "3. Have client set up budget alerts"
echo "4. Document transfer completion date"
echo ""
echo "Your charges will stop within 24 hours."
echo "Client will start receiving bills within 1-2 billing cycles."
echo ""
