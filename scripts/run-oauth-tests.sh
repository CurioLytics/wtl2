#!/bin/bash

# Script to run all OAuth-related tests
echo "Running OAuth-related tests..."

# Run the OAuth buttons component test
echo "Testing OAuth buttons component..."
npx vitest tests/components/oauth-buttons.test.tsx

# Run the auth callback route test
echo "Testing auth callback route..."
npx vitest tests/components/auth-callback.test.tsx

echo "All OAuth tests completed!"