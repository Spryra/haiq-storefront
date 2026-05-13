#!/bin/bash

# HAIQ API Integration Test Suite
# Tests all critical API endpoints and functionality

set -e

API_URL="https://haiq-api.onrender.com"
FRONTEND_URL="https://haiqweb.vercel.app"
TEST_RESULTS=""
PASSED=0
FAILED=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test helper function
run_test() {
    local test_name="$1"
    local command="$2"
    local expected="$3"

    echo -n "Testing: $test_name ... "

    if result=$(eval "$command" 2>&1); then
        if echo "$result" | grep -q "$expected"; then
            echo -e "${GREEN}PASS${NC}"
            ((PASSED++))
        else
            echo -e "${RED}FAIL${NC}"
            echo "  Expected: $expected"
            echo "  Got: $result"
            ((FAILED++))
        fi
    else
        echo -e "${RED}FAIL${NC} (Command failed)"
        echo "  Error: $result"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "HAIQ API Integration Test Suite"
echo "=========================================="
echo ""

# Test 1: API Health Check
echo "=== Health & Status Tests ==="
run_test "API Health Endpoint" \
    "curl -s $API_URL/health | grep -o '\"status\":\"ok\"'" \
    '"status":"ok"'

# Test 2: Products API
echo ""
echo "=== Products API Tests ==="
run_test "Get Products List" \
    "curl -s $API_URL/v1/products" \
    '"success":true'

run_test "Products Have Items" \
    "curl -s $API_URL/v1/products | grep '\"id\":\"' | wc -l" \
    "[1-9]"

# Test 3: Delivery Zones API
echo ""
echo "=== Delivery Zones API Tests ==="
run_test "Get Delivery Zones" \
    "curl -s $API_URL/v1/delivery-zones | grep -o '\"success\":true'" \
    '"success":true'

run_test "Zones Have Content" \
    "curl -s $API_URL/v1/delivery-zones | grep '\"name\":\"' | wc -l" \
    "[1-9]"

run_test "Muyenga Zone Exists" \
    "curl -s $API_URL/v1/delivery-zones | grep -o 'Muyenga'" \
    "Muyenga"

run_test "Zone Has Pricing" \
    "curl -s $API_URL/v1/delivery-zones | grep -o '\"price\":[0-9]*' | head -1" \
    '"price":'

# Test 4: Featured Products
echo ""
echo "=== Featured Products Tests ==="
run_test "Get Featured Products" \
    "curl -s $API_URL/v1/products/featured | grep -o '\"success\":true'" \
    '"success":true'

# Test 5: Product by Slug
echo ""
echo "=== Product Detail Tests ==="
run_test "Get Product by Slug (Venom)" \
    "curl -s $API_URL/v1/products/venom | grep -o 'Venom'" \
    "Venom"

run_test "Product Has Variants" \
    "curl -s $API_URL/v1/products/venom | grep -o '\"variants\"' | wc -l | grep -E '[1-9]'" \
    "[1-9]"

run_test "Product Has Images" \
    "curl -s $API_URL/v1/products/venom | grep -o '\"images\"' | wc -l | grep -E '[1-9]'" \
    "[1-9]"

# Test 6: Box Office Virtual Product
echo ""
echo "=== Box Office Tests ==="
run_test "Get Box Office Product" \
    "curl -s $API_URL/v1/products/box-office | grep -o 'Box Office'" \
    "Box Office"

run_test "Box Office Has Correct Price" \
    "curl -s $API_URL/v1/products/box-office | grep -o '\"price\":80000'" \
    '"price":80000'

# Test 7: Database Health
echo ""
echo "=== Database Health Tests ==="
run_test "Database Tables Exist" \
    "curl -s $API_URL/debug/tables | grep -o '\"success\":true'" \
    '"success":true'

run_test "Migrations Table Exists" \
    "curl -s $API_URL/debug/tables | grep -o '\"hasMigrations\":true'" \
    '"hasMigrations":true'

run_test "Delivery Zones Table Exists" \
    "curl -s $API_URL/debug/tables | grep -o '\"hasDeliveryZones\":true'" \
    '"hasDeliveryZones":true'

# Test 8: Categories API
echo ""
echo "=== Categories API Tests ==="
run_test "Get Categories" \
    "curl -s $API_URL/v1/categories | grep -o '\"success\":true'" \
    '"success":true'

# Test 9: Newsletter API (if available)
echo ""
echo "=== Newsletter API Tests ==="
run_test "Newsletter Endpoint Exists" \
    "curl -s $API_URL/v1/newsletter/subscribe 2>&1 | grep -o 'not found' || echo 'exists'" \
    "exists"

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Review above for details.${NC}"
    exit 1
fi
