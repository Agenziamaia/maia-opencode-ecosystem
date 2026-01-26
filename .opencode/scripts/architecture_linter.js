#!/usr/bin/env node
/**
 * 🏗️ MAIA Architecture Linter
 * Verifies every directory in the repo is documented in ARCHITECTURE.md
 * Run: node .opencode/scripts/architecture_linter.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT = process.cwd();
const ARCHITECTURE_PATH = path.join(ROOT, '.opencode', 'context', 'ARCHITECTURE.md');
const IGNORE_DIRS = [
    'node_modules',
    '.git',
    '.archive',
    '.DS_Store',
    'coverage',
    'dist',
    'build',
    '.next',
    '__pycache__',
    '.venv',
    'venv',
];

// Directories that MUST be documented
const REQUIRED_ENTRIES = [
    '.opencode/',
    '.opencode/agents/',
    '.opencode/scripts/',
    '.opencode/giuzu-training/',
    '.opencode/schema/',
    'PROJECTS/',
    'DOCS/',
    'ARCHIVE/',
    'CONFIG/',
    'UNIVERSAL/',
];

function getAllDirectories(dir, base = '') {
    const dirs = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && !IGNORE_DIRS.includes(entry.name)) {
                const relativePath = path.join(base, entry.name);
                dirs.push(relativePath + '/');
                // Recurse only 2 levels deep to avoid spam
                if (relativePath.split('/').length < 3) {
                    dirs.push(...getAllDirectories(path.join(dir, entry.name), relativePath));
                }
            }
        }
    } catch (e) {
        // Directory not accessible, skip
    }
    return dirs;
}

function parseArchitectureMd() {
    if (!fs.existsSync(ARCHITECTURE_PATH)) {
        console.error('❌ ARCHITECTURE.md not found at:', ARCHITECTURE_PATH);
        console.log('   Creating template...');
        return { exists: false, entries: [] };
    }

    const content = fs.readFileSync(ARCHITECTURE_PATH, 'utf-8');
    // Match backtick-wrapped directory names like `dirname/`
    const matches = content.match(/`[^`]+\/`/g) || [];
    const entries = matches.map(m => m.replace(/`/g, ''));
    return { exists: true, entries, content };
}

function main() {
    console.log('🏗️  MAIA Architecture Linter');
    console.log('━'.repeat(50));

    const allDirs = getAllDirectories(ROOT);
    const { exists, entries, content } = parseArchitectureMd();

    if (!exists) {
        console.log('\n📝 Required entries for new ARCHITECTURE.md:');
        REQUIRED_ENTRIES.forEach(e => console.log(`   - \`${e}\``));
        process.exit(1);
    }

    console.log(`📂 Found ${allDirs.length} directories in repo`);
    console.log(`📄 Found ${entries.length} entries in ARCHITECTURE.md`);

    // Check required entries
    const missingRequired = REQUIRED_ENTRIES.filter(req =>
        !entries.some(e => e.includes(req) || req.includes(e))
    );

    // Check for undocumented directories (top-level only for noise reduction)
    const topLevelDirs = allDirs.filter(d => !d.includes('/') || d.split('/').length <= 2);
    const undocumented = topLevelDirs.filter(dir =>
        !entries.some(e => dir.startsWith(e) || e.startsWith(dir))
    );

    let hasErrors = false;

    if (missingRequired.length > 0) {
        console.log('\n❌ Missing REQUIRED entries in ARCHITECTURE.md:');
        missingRequired.forEach(e => console.log(`   - ${e}`));
        hasErrors = true;
    }

    if (undocumented.length > 0) {
        console.log('\n⚠️  Undocumented directories (consider adding):');
        undocumented.slice(0, 10).forEach(e => console.log(`   - ${e}`));
        if (undocumented.length > 10) {
            console.log(`   ... and ${undocumented.length - 10} more`);
        }
    }

    // Check for stale entries (documented but don't exist)
    const staleEntries = entries.filter(entry => {
        const fullPath = path.join(ROOT, entry.replace(/\/$/, ''));
        return !fs.existsSync(fullPath) && !entry.includes('*');
    });

    if (staleEntries.length > 0) {
        console.log('\n🗑️  Stale entries (documented but missing):');
        staleEntries.forEach(e => console.log(`   - ${e}`));
    }

    if (!hasErrors && undocumented.length === 0 && staleEntries.length === 0) {
        console.log('\n✅ Architecture is fully documented!');
        process.exit(0);
    } else if (hasErrors) {
        process.exit(1);
    } else {
        console.log('\n⚠️  Warnings found but no critical errors');
        process.exit(0);
    }
}

main();
