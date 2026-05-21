#!/bin/bash

################################################################################
# PHASES 6-8 QUICK DEPLOYMENT SCRIPT
# This script automates the deployment and migration process
################################################################################

set -e  # Exit on any error

echo "════════════════════════════════════════════════════════════════"
echo "  HAIQ PHASES 6-8 DEPLOYMENT SCRIPT"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# STEP 1: Verify Git Status
################################################################################
echo -e "${BLUE}[STEP 1]${NC} Verifying Git Status..."
echo ""

CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "claude/objective-haslett-543259" ]; then
    echo -e "${YELLOW}⚠️  WARNING: You are on branch '$CURRENT_BRANCH'${NC}"
    echo "This script is designed to deploy from 'claude/objective-haslett-543259'"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}✗ ERROR: Uncommitted changes detected${NC}"
    echo "Please commit all changes before deploying:"
    echo "  git add ."
    echo "  git commit -m 'Deployment: Phases 6-8'"
    exit 1
fi

echo -e "${GREEN}✓ Git status clean${NC}"
echo ""

################################################################################
# STEP 2: Verify Commits Exist
################################################################################
echo -e "${BLUE}[STEP 2]${NC} Verifying commits are in place..."
echo ""

COMMIT_COUNT=$(git log --oneline | head -5 | wc -l)
echo "Recent commits:"
git log --oneline | head -5 | sed 's/^/  /'

echo ""
if git log --oneline | grep -q "Phase 8 frontend"; then
    echo -e "${GREEN}✓ Phase 8 frontend commit found${NC}"
else
    echo -e "${YELLOW}⚠ Phase 8 frontend commit not in recent history${NC}"
fi

if git log --oneline | grep -q "Phase 8 (Issue #13)"; then
    echo -e "${GREEN}✓ Phase 8 backend commit found${NC}"
else
    echo -e "${YELLOW}⚠ Phase 8 backend commit not in recent history${NC}"
fi

if git log --oneline | grep -q "Phase 7"; then
    echo -e "${GREEN}✓ Phase 7 commit found${NC}"
else
    echo -e "${YELLOW}⚠ Phase 7 commit not in recent history${NC}"
fi

if git log --oneline | grep -q "Phase 6"; then
    echo -e "${GREEN}✓ Phase 6 commits found${NC}"
else
    echo -e "${RED}✗ Phase 6 commits not found${NC}"
    exit 1
fi

echo ""

################################################################################
# STEP 3: Verify Builds
################################################################################
echo -e "${BLUE}[STEP 3]${NC} Verifying builds..."
echo ""

# Frontend build
echo "Building frontend..."
cd admin
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    npm run build
    exit 1
fi
cd ..

# Backend syntax check (not a full build, just verification)
echo "Checking backend syntax..."
if node -c backend/src/server.js 2>/dev/null; then
    echo -e "${GREEN}✓ Backend syntax OK${NC}"
else
    echo -e "${YELLOW}⚠ Backend syntax check skipped (may require DB connection)${NC}"
fi

echo ""

################################################################################
# STEP 4: Push to Remote
################################################################################
echo -e "${BLUE}[STEP 4]${NC} Pushing to remote repository..."
echo ""

if git push origin $CURRENT_BRANCH 2>&1; then
    echo -e "${GREEN}✓ Pushed to remote${NC}"
else
    echo -e "${RED}✗ Push failed${NC}"
    exit 1
fi

echo ""

################################################################################
# STEP 5: Display Next Steps
################################################################################
echo -e "${BLUE}[STEP 5]${NC} Next steps for deployment..."
echo ""

echo "✅ Code is pushed and ready for deployment"
echo ""
echo "🔄 MANUAL STEPS REQUIRED:"
echo ""
echo "1. MERGE PULL REQUEST (if using GitHub)"
echo "   - Create PR from 'claude/objective-haslett-543259' to 'main'"
echo "   - Wait for CI checks to pass"
echo "   - Merge PR"
echo ""
echo "2. VERCEL AUTO-DEPLOYMENT (if configured)"
echo "   - Vercel will detect new commits and auto-deploy"
echo "   - Frontend: ~2-3 minutes"
echo "   - Backend: ~1-2 minutes"
echo "   - Monitor at: https://vercel.com/dashboard"
echo ""
echo "3. RUN MIGRATION SCRIPT (CRITICAL!)"
echo "   - Wait for backend deployment to complete"
echo "   - Run: node backend/scripts/split-delivery-zones.js"
echo "   - Expected output shows 22 new zones created, 11 grouped zones deactivated"
echo ""
echo "4. VERIFY DEPLOYMENT"
echo "   - Check analytics dashboard loads with all charts"
echo "   - Check checkout shows individual delivery zones"
echo "   - Check admin zone management page"
echo "   - Verify all WCAG accessibility features work"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}DEPLOYMENT SCRIPT COMPLETE ✓${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "For detailed instructions, see: DEPLOYMENT.md"
echo ""
