# Node.js Installation Guide

## Option 1: Install via Homebrew (Recommended)

If you have Homebrew installed:
```bash
brew install node
```

If you don't have Homebrew, install it first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Option 2: Install via nvm (Node Version Manager)

This allows you to manage multiple Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell
source ~/.zshrc

# Install the latest LTS version of Node.js
nvm install --lts
nvm use --lts
```

## Option 3: Download from nodejs.org

1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer
4. Restart your terminal

## After Installation

Once Node.js is installed, verify it works:
```bash
node --version
npm --version
```

Then install project dependencies:
```bash
cd /Users/Adolph/Documents/GitHub/pivotnplplatform
npm install
```

