#!/bin/bash

# TriBridge GitHub Pages Deployment Script
# This script automates the deployment process to GitHub Pages

set -e

echo "🚀 Starting TriBridge deployment to GitHub Pages..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_USERNAME="RedMagicVer7"
REPO_NAME="tribridge-crossroads"
BRANCH="main"
BUILD_DIR="dist"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  GitHub Username: $GITHUB_USERNAME"
echo "  Repository: $REPO_NAME"
echo "  Branch: $BRANCH"
echo "  Build Directory: $BUILD_DIR"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if git is configured
if ! git config user.name >/dev/null; then
    echo -e "${BLUE}🔧 Setting up git configuration...${NC}"
    git config user.name "$GITHUB_USERNAME"
    git config user.email "$GITHUB_USERNAME@users.noreply.github.com"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Build the project
echo -e "${BLUE}🔨 Building the project...${NC}"
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Error: Build failed. $BUILD_DIR directory not found.${NC}"
    exit 1
fi

# Add CNAME file for custom domain (if needed)
echo "tribridge.pages.dev" > $BUILD_DIR/CNAME

# Deploy to GitHub Pages
echo -e "${BLUE}🚀 Deploying to GitHub Pages...${NC}"

# Initialize gh-pages branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    echo -e "${BLUE}📝 Creating gh-pages branch...${NC}"
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout $BRANCH
fi

# Deploy using gh-pages package or manual method
if command -v npx >/dev/null && npm list gh-pages >/dev/null 2>&1; then
    echo -e "${BLUE}📤 Using gh-pages package for deployment...${NC}"
    npx gh-pages -d $BUILD_DIR -b gh-pages -m "Deploy TriBridge $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo -e "${BLUE}📤 Using manual deployment method...${NC}"
    
    # Create a temporary directory
    TEMP_DIR=$(mktemp -d)
    cp -r $BUILD_DIR/* $TEMP_DIR/
    
    # Switch to gh-pages branch
    git checkout gh-pages
    
    # Clear existing files (except .git)
    find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +
    
    # Copy built files
    cp -r $TEMP_DIR/* .
    
    # Add and commit
    git add .
    git commit -m "Deploy TriBridge $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
    
    # Push to GitHub
    git push origin gh-pages
    
    # Switch back to main branch
    git checkout $BRANCH
    
    # Clean up
    rm -rf $TEMP_DIR
fi

# Enable GitHub Pages (this requires GitHub CLI or manual setup)
if command -v gh >/dev/null; then
    echo -e "${BLUE}⚙️ Configuring GitHub Pages settings...${NC}"
    gh repo edit --enable-pages --pages-branch gh-pages || echo "GitHub Pages configuration may need manual setup"
fi

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your site will be available at: https://$GITHUB_USERNAME.github.io/$REPO_NAME${NC}"
echo -e "${GREEN}🔗 Custom domain: https://tribridge.pages.dev${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Go to GitHub repository settings"
echo "  2. Navigate to Pages section"
echo "  3. Ensure source is set to 'gh-pages' branch"
echo "  4. Configure custom domain if needed"
echo ""