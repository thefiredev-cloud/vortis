#!/bin/bash

# Framer Motion Removal Verification Script
# Run this after removing framer-motion to verify complete removal

set -e

echo "🔍 Verifying Framer Motion Removal..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for framer-motion in source files
echo "📁 Checking source files for framer-motion imports..."
if grep -r "from ['\"]framer-motion['\"]" components/ app/ 2>/dev/null; then
    echo -e "${RED}❌ Found framer-motion imports in source files!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No framer-motion imports found in source files${NC}"
fi

# Check for motion. usage
echo ""
echo "🔍 Checking for motion. usage..."
if grep -r "motion\." components/ app/ --include="*.tsx" --include="*.ts" 2>/dev/null; then
    echo -e "${RED}❌ Found motion. usage in source files!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No motion. usage found in source files${NC}"
fi

# Check for AnimatePresence usage
echo ""
echo "🔍 Checking for AnimatePresence usage..."
if grep -r "AnimatePresence" components/ app/ --include="*.tsx" --include="*.ts" 2>/dev/null; then
    echo -e "${RED}❌ Found AnimatePresence usage in source files!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No AnimatePresence usage found in source files${NC}"
fi

# Check for useInView from framer-motion
echo ""
echo "🔍 Checking for useInView from framer-motion..."
if grep -r "useInView.*framer-motion" components/ app/ 2>/dev/null; then
    echo -e "${RED}❌ Found useInView from framer-motion!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No useInView from framer-motion found${NC}"
fi

# Check package.json
echo ""
echo "📦 Checking package.json..."
if grep -q "framer-motion" package.json; then
    echo -e "${RED}❌ framer-motion still in package.json!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ framer-motion removed from package.json${NC}"
fi

# Check if CSS animations are present
echo ""
echo "🎨 Verifying CSS animations are present..."
REQUIRED_ANIMATIONS=(
    "fadeInUp"
    "fadeInUpDir"
    "shine"
    "scaleIn"
    "blurFadeIn"
    "slideUpFade"
    "rotate180"
    "expandHeight"
)

for anim in "${REQUIRED_ANIMATIONS[@]}"; do
    if grep -q "@keyframes $anim" app/globals.css; then
        echo -e "${GREEN}  ✅ @keyframes $anim${NC}"
    else
        echo -e "${RED}  ❌ Missing @keyframes $anim${NC}"
        exit 1
    fi
done

# Check for Intersection Observer usage
echo ""
echo "👁️  Verifying Intersection Observer usage..."
if grep -r "IntersectionObserver" components/ui/ 2>/dev/null | grep -q "IntersectionObserver"; then
    echo -e "${GREEN}✅ Intersection Observer implemented${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: No Intersection Observer found (might be okay if not needed)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All verification checks passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: npm install"
echo "  2. Run: npm run build"
echo "  3. Test animations in browser"
echo "  4. Check bundle size reduction"
echo ""
echo "Expected bundle reduction: ~168KB"
