#!/bin/bash
# Helper script to create the oauth2-proxy-secrets Kubernetes Secret

echo "=== OAuth2 Proxy Secret Generator ==="

# Generate a secure 32-byte cookie secret
COOKIE_SECRET=$(python3 -c 'import os,base64; print(base64.b64encode(os.urandom(32)).decode("utf-8"))')

echo ""
echo "1. Go to GitHub -> Settings -> Developer Settings -> OAuth Apps"
echo "2. Click 'New OAuth App'"
echo "3. Homepage URL: https://grafana.yourdomain.com (or your main ingress)"
echo "4. Authorization callback URL: https://grafana.yourdomain.com/oauth2/callback"
echo ""

read -p "Enter your GitHub OAuth Client ID: " CLIENT_ID
read -s -p "Enter your GitHub OAuth Client Secret: " CLIENT_SECRET
echo ""

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "Error: Client ID and Client Secret are required."
    exit 1
fi

kubectl create secret generic oauth2-proxy-secrets \
    --namespace=default \
    --from-literal=client-id="$CLIENT_ID" \
    --from-literal=client-secret="$CLIENT_SECRET" \
    --from-literal=cookie-secret="$COOKIE_SECRET" \
    --dry-run=client -o yaml > oauth2-proxy-secret.yaml

echo ""
echo "✅ Secret generated at oauth2-proxy-secret.yaml"
echo "Run 'kubectl apply -f oauth2-proxy-secret.yaml' to apply it to your cluster."
