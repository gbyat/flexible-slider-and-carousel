#!/usr/bin/env node

/**
 * Convert .po file to .mo file
 * Simple implementation for WordPress translation files
 */

const fs = require('fs');
const path = require('path');

function parsePOFile(content) {
    const entries = {};
    let currentMsgid = '';
    let currentMsgstr = '';
    let inMsgstr = false;

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('msgid ')) {
            // Save previous entry
            if (currentMsgid && currentMsgstr) {
                entries[currentMsgid] = currentMsgstr;
            }

            currentMsgid = line.substring(7, line.length - 1); // Remove 'msgid "' and '"'
            currentMsgstr = '';
            inMsgstr = false;
        } else if (line.startsWith('msgstr ')) {
            currentMsgstr = line.substring(8, line.length - 1); // Remove 'msgstr "' and '"'
            inMsgstr = true;
        } else if (inMsgstr && line.startsWith('"') && line.endsWith('"')) {
            // Continuation line for msgstr
            currentMsgstr += line.substring(1, line.length - 1);
        } else if (line.startsWith('"') && line.endsWith('"') && !inMsgstr) {
            // Continuation line for msgid
            currentMsgid += line.substring(1, line.length - 1);
        }
    }

    // Save last entry
    if (currentMsgid && currentMsgstr) {
        entries[currentMsgid] = currentMsgstr;
    }

    return entries;
}

function createMOFile(entries) {
    // MO file format: header + entries
    const strings = Object.keys(entries).sort();
    const translations = strings.map(key => entries[key]);

    // Calculate offsets
    const keyLengths = strings.map(s => s.length + 1); // +1 for null terminator
    const valueLengths = translations.map(s => s.length + 1);

    let keyOffset = 28; // Header size
    let valueOffset = keyOffset + (strings.length * 16); // 16 bytes per entry

    // Build key offsets
    const keyOffsets = [];
    for (let i = 0; i < strings.length; i++) {
        keyOffsets.push(keyOffset);
        keyOffset += keyLengths[i];
    }

    // Build value offsets
    const valueOffsets = [];
    for (let i = 0; i < translations.length; i++) {
        valueOffsets.push(valueOffset);
        valueOffset += valueLengths[i];
    }

    // Create binary data with proper size calculation
    const totalSize = valueOffset + valueLengths.reduce((sum, len) => sum + len, 0);
    const buffer = Buffer.alloc(totalSize);
    let pos = 0;

    // Write header (little-endian)
    buffer.writeUInt32LE(0x950412de, pos); pos += 4; // Magic number
    buffer.writeUInt32LE(0, pos); pos += 4; // Version
    buffer.writeUInt32LE(strings.length, pos); pos += 4; // Number of entries
    buffer.writeUInt32LE(28, pos); pos += 4; // Offset of key table
    buffer.writeUInt32LE(28 + strings.length * 16, pos); pos += 4; // Offset of value table
    buffer.writeUInt32LE(0, pos); pos += 4; // Hash table size
    buffer.writeUInt32LE(0, pos); pos += 4; // Hash table offset

    // Write key table
    for (let i = 0; i < strings.length; i++) {
        buffer.writeUInt32LE(keyLengths[i], pos); pos += 4; // Length
        buffer.writeUInt32LE(keyOffsets[i], pos); pos += 4; // Offset
    }

    // Write value table
    for (let i = 0; i < translations.length; i++) {
        buffer.writeUInt32LE(valueLengths[i], pos); pos += 4; // Length
        buffer.writeUInt32LE(valueOffsets[i], pos); pos += 4; // Offset
    }

    // Write strings with proper encoding
    for (let i = 0; i < strings.length; i++) {
        const str = strings[i] + '\0';
        buffer.write(str, keyOffsets[i], 'utf8');
    }

    for (let i = 0; i < translations.length; i++) {
        const str = translations[i] + '\0';
        buffer.write(str, valueOffsets[i], 'utf8');
    }

    return buffer;
}

function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Usage: node po-to-mo.js <input.po> [output.mo]');
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.po', '.mo');

    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file '${inputFile}' not found`);
        process.exit(1);
    }

    try {
        console.log(`Reading ${inputFile}...`);
        const poContent = fs.readFileSync(inputFile, 'utf8');

        console.log('Parsing PO file...');
        const entries = parsePOFile(poContent);
        console.log(`Found ${Object.keys(entries).length} translation entries`);

        console.log('Creating MO file...');
        const moBuffer = createMOFile(entries);

        console.log(`Writing ${outputFile}...`);
        fs.writeFileSync(outputFile, moBuffer);

        console.log('✅ Successfully converted PO to MO file!');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { parsePOFile, createMOFile };
