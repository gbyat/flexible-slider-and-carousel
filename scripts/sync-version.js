const fs = require('fs');
const path = require('path');

// Read version from package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageData.version;

console.log(`🔄 Syncing version ${version} to plugin files...`);

// Main plugin file
const pluginFile = path.join(__dirname, '..', 'flexible-slider-and-carousel.php');

if (fs.existsSync(pluginFile)) {
    let pluginContent = fs.readFileSync(pluginFile, 'utf8');

    // Update version in plugin header
    pluginContent = pluginContent.replace(
        /Version:\s*\d+\.\d+\.\d+/,
        `Version: ${version}`
    );

    // Update version in plugin data (this pattern doesn't exist in our plugin)
    // pluginContent = pluginContent.replace(
    //     /"version"\s*=>\s*['"]\d+\.\d+\.\d+['"]/,
    //     `"version" => "${version}"`
    // );

    // Update FSC_PLUGIN_VERSION constant
    pluginContent = pluginContent.replace(
        /define\('FSC_PLUGIN_VERSION',\s*['"]\d+\.\d+\.\d+['"]\);/,
        `define('FSC_PLUGIN_VERSION', '${version}');`
    );

    fs.writeFileSync(pluginFile, pluginContent);
    console.log('✅ Updated flexible-slider-and-carousel.php');
} else {
    console.log('⚠️  Plugin file not found, skipping...');
}

// Update version in block.json files
const blockFiles = [
    'blocks/slider/block.json',
    'blocks/frame/block.json'
];

blockFiles.forEach(blockFile => {
    const blockPath = path.join(__dirname, '..', blockFile);
    if (fs.existsSync(blockPath)) {
        let blockContent = fs.readFileSync(blockPath, 'utf8');

        // Update version in block.json
        blockContent = blockContent.replace(
            /"version"\s*:\s*['"]\d+\.\d+\.\d+['"]/,
            `"version": "${version}"`
        );

        fs.writeFileSync(blockPath, blockContent);
        console.log(`✅ Updated ${blockFile}`);
    }
});

console.log(`🎉 Version ${version} synced to all plugin files!`);
