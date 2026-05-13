#!/bin/bash

# Master Test Runner
# Executes all test suites and generates comprehensive report

set -e

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="/tmp/haiq_test_results_$(date +%s).txt"

# Color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "HAIQ Comprehensive Test Suite"
echo "=========================================="
echo "Test Start: $(date)"
echo "Results will be saved to: $RESULTS_FILE"
echo ""

# Redirect output to both console and file
{
    echo "HAIQ Test Execution Report"
    echo "Started: $(date)"
    echo ""

    # Test 1: API Integration
    echo "${BLUE}===============================================${NC}"
    echo "Running API Integration Tests..."
    echo "${BLUE}===============================================${NC}"

    if bash "$TEST_DIR/api-integration.sh"; then
        echo -e "${GREEN}✓ API Integration Tests Passed${NC}"
        API_RESULT=0
    else
        echo -e "${RED}✗ API Integration Tests Failed${NC}"
        API_RESULT=1
    fi

    echo ""

    # Test 2: Checkout Flow
    echo "${BLUE}===============================================${NC}"
    echo "Running Checkout Flow Tests..."
    echo "${BLUE}===============================================${NC}"

    if bash "$TEST_DIR/checkout-flow.sh"; then
        echo -e "${GREEN}✓ Checkout Flow Tests Passed${NC}"
        CHECKOUT_RESULT=0
    else
        echo -e "${RED}✗ Checkout Flow Tests Failed${NC}"
        CHECKOUT_RESULT=1
    fi

    echo ""
    echo "=========================================="
    echo "Final Test Summary"
    echo "=========================================="

    if [ $API_RESULT -eq 0 ] && [ $CHECKOUT_RESULT -eq 0 ]; then
        echo -e "${GREEN}✓ All test suites passed!${NC}"
        echo ""
        echo "Status: READY FOR PRODUCTION TESTING"
        echo ""
        echo "Next steps:"
        echo "1. Manual browser-based E2E testing of checkout flow"
        echo "2. Test Build Your Box selection and submission"
        echo "3. Verify order creation and confirmation"
        echo "4. Test delivery zone pricing"
        echo "5. Test localStorage persistence"
        OVERALL_RESULT=0
    else
        echo -e "${RED}✗ Some test suites failed${NC}"
        echo ""
        echo "Status: REQUIRES FIXES"
        echo ""
        echo "Failed suites:"
        [ $API_RESULT -ne 0 ] && echo "  - API Integration Tests"
        [ $CHECKOUT_RESULT -ne 0 ] && echo "  - Checkout Flow Tests"
        OVERALL_RESULT=1
    fi

    echo ""
    echo "Test completed: $(date)"

} | tee "$RESULTS_FILE"

echo ""
echo "Full results saved to: $RESULTS_FILE"
exit $OVERALL_RESULT
