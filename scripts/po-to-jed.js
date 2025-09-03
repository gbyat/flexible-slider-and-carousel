#!/usr/bin/env node

// Convert a .po file into a Jed 1.x JSON file for WordPress/Gutenberg
// Minimal parser for simple msgid/msgstr (no plurals/context handling here)

const fs = require('fs');
const path = require('path');

function parsePO(content) {
    const entries = [];
    let msgid = null;
    let msgstr = null;
    let state = null; // 'msgid' | 'msgstr' | null

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('msgid ')) {
            if (msgid !== null && msgstr !== null) {
                entries.push({ msgid, msgstr });
            }
            msgid = line.replace(/^msgid\s+"/, '').replace(/"$/, '');
            msgstr = '';
            state = 'msgid';
            continue;
        }
        if (line.startsWith('msgstr ')) {
            msgstr = line.replace(/^msgstr\s+"/, '').replace(/"$/, '');
            state = 'msgstr';
            continue;
        }
        if (line.startsWith('msgctxt ')) {
            // ignore context for this minimal converter
            continue;
        }
        if (/^\s*".*"\s*$/.test(line)) {
            const chunk = line.trim().replace(/^"/, '').replace(/"$/, '');
            if (state === 'msgid') msgid += chunk;
            if (state === 'msgstr') msgstr += chunk;
            continue;
        }
        // On blank or other lines, if we have a pair collected, push it
        if (line.trim() === '' && msgid !== null && msgstr !== null) {
            entries.push({ msgid, msgstr });
            msgid = null;
            msgstr = null;
            state = null;
        }
    }
    if (msgid !== null && msgstr !== null) {
        entries.push({ msgid, msgstr });
    }
    // Remove header (empty msgid)
    return entries.filter(e => e.msgid !== '');
}

function buildJed(domain, locale, entries) {
    const translation = {};
    for (const { msgid, msgstr } of entries) {
        if (!msgid) continue;
        translation[msgid] = [msgstr];
    }
    return {
        locale_data: {
            [domain]: Object.assign({ '': { domain, lang: locale } }, translation)
        }
    };
}

function main() {
    const input = process.argv[2];
    const domain = 'flexible-slider-and-carousel';
    if (!input) {
        console.error('Usage: node scripts/po-to-jed.js <path-to-po>');
        process.exit(1);
    }
    const poPath = path.resolve(input);
    if (!fs.existsSync(poPath)) {
        console.error('PO not found:', poPath);
        process.exit(1);
    }
    const po = fs.readFileSync(poPath, 'utf8');
    const entries = parsePO(po);

    // derive locale from filename: domain-locale.po or *-locale.po
    const base = path.basename(poPath, '.po');
    const parts = base.split('-');
    const locale = parts.slice(-2).join('_').includes('DE') ? 'de_DE' : 'de_DE'; // fallback

    const jed = buildJed(domain, locale, entries);
    const outDir = path.dirname(poPath);
    const fileA = path.join(outDir, `${domain}-${locale}.json`);
    const fileB = path.join(outDir, `${domain}-${locale}-000000000000.json`);
    fs.writeFileSync(fileA, JSON.stringify(jed));
    fs.writeFileSync(fileB, JSON.stringify(jed));
    console.log('Wrote:', fileA);
    console.log('Wrote:', fileB);
}

if (require.main === module) main();
