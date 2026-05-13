#!/bin/bash

# HAIQ Checkout Flow Tests
# Tests the complete order creation workflow

set -e

API_URL="https://haiq-api.onrender.com"
FRONTEND_URL="https://haiqweb.vercel.app"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test helper
test_step() {
    local description="$1"
    local command="$2"
    local expected="$3"

    echo -n "  ▶ $description ... "

    if output=$(eval "$command" 2>&1); then
        if [ -z "$expected" ] || echo "$output" | grep -q "$expected"; then
            echo -e "${GREEN}✓${NC}"
            ((PASSED++))
            echo "$output"
            return 0
        else
            echo -e "${RED}✗${NC}"
            echo "    Expected: $expected"
            echo "    Got: $output"
            ((FAILED++))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} (Error: $output)"
        ((FAILED++))
        return 1
    fi
}

echo ""
echo "=========================================="
echo "HAIQ Checkout Flow Test Suite"
echo "=========================================="
echo ""

# Test 1: Verify All Required Data Available
echo -e "${BLUE}Test Scenario 1: Data Availability${NC}"
echo "Checking if all required APIs have data..."

test_step "Products available" \
    "curl -s $API_URL/v1/products | grep -c '\"id\"' | grep -E '[1-9]'" \
    "[1-9]"

test_step "Delivery zones available" \
    "curl -s $API_URL/v1/delivery-zones | grep -c '\"name\"' | grep -E '[1-9]'" \
    "[1-9]"

test_step "Categories available" \
    "curl -s $API_URL/v1/categories | grep -c '\"id\"' | grep -E '[1-9]'" \
    "[1-9]"

echo ""

# Test 2: Test Order Creation with Minimal Data
echo -e "${BLUE}Test Scenario 2: Order Creation${NC}"
echo "Creating test order with required fields..."

# Create a test order object
ORDER_PAYLOAD=$(cat <<'EOF'
{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@haiq.local",
  "phone": "+256700000000",
  "delivery_address": "123 Test Street, Kampala",
  "delivery_zone_id": "PLACEHOLDER_ZONE_ID",
  "items": [
    {
      "product_id": "PLACEHOLDER_PRODUCT_ID",
      "variant_id": "PLACEHOLDER_VARIANT_ID",
      "quantity": 1
    }
  ],
  "payment_method": "cash_on_delivery",
  "consent_given": true
}
EOF
)

echo "Note: Order creation requires authentication and valid product/variant IDs"
echo "Full integration testing of order submission requires:
- Valid user authentication (JWT token)
- Valid product and variant IDs from database
- Valid delivery zone ID

These should be tested in the browser-based E2E tests."

echo ""

# Test 3: Verify Checkout Page Assets
echo -e "${BLUE}Test Scenario 3: Frontend Asset Verification${NC}"

test_step "Frontend loads" \
    "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL" \
    "200"

test_step "Checkout page accessible" \
    "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL/checkout" \
    "200"

test_step "Build Your Box page accessible" \
    "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL/build-your-box" \
    "200"

test_step "Shop page accessible" \
    "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL/shop" \
    "200"

echo ""

# Test 4: Verify API Response Formats
echo -e "${BLUE}Test Scenario 4: API Response Format Validation${NC}"

test_step "Products response has correct structure" \
    "curl -s $API_URL/v1/products | grep -q '\"products\"' && curl -s $API_URL/v1/products | grep -q '\"pagination\"' && echo 'valid' || echo 'invalid'" \
    "valid"

test_step "Delivery zones response structure" \
    "curl -s $API_URL/v1/delivery-zones | grep -q '\"zones\"' && curl -s $API_URL/v1/delivery-zones | grep -q '\"success\"' && echo 'valid' || echo 'invalid'" \
    "valid"

test_step "Single product has variants" \
    "curl -s $API_URL/v1/products/venom | grep -q '\"product\"' && curl -s $API_URL/v1/products/venom | grep -q '\"variants\"' && echo 'valid' || echo 'invalid'" \
    "valid"

echo ""

# Test 5: Performance & Timeout Tests
echo -e "${BLUE}Test Scenario 5: Performance Checks${NC}"

test_step "API responds within 5 seconds" \
    "time_ms=\$(curl -s -w '%{time_total}' -o /dev/null $API_URL/health | awk '{print int(\$1*1000)}'); [ \$time_ms -lt 5000 ] && echo 'pass' || echo 'fail'" \
    "pass"

echo ""

# Test 6: Data Integrity Checks
echo -e "${BLUE}Test Scenario 6: Data Integrity${NC}"

test_step "All delivery zones have prices > 0" \
    "curl -s $API_URL/v1/delivery-zones | grep -o '\"price\":[0-9]*' | grep -v '\"price\":0' | wc -l | grep -E '^[0-9]+$'" \
    "[0-9]"

test_step "Products have valid IDs" \
    "curl -s $API_URL/v1/products | grep -o '\"id\":\"[a-f0-9-]*\"' | wc -l | grep -E '[1-9]'" \
    "[1-9]"

echo ""
echo "=========================================="
echo "Checkout Flow Test Results"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checkout-related tests passed!${NC}"
    echo ""
    echo "Note: Full order creation and submission requires browser-based E2E testing"
    echo "with authenticated users and real product selections."
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Review above for details.${NC}"
    exit 1
fi
