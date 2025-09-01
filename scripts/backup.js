const fs = require('fs');
const path = require('path');

// Get current timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Files to backup
const filesToBackup = [
    // Main plugin file
    'flexible-slider-and-carousel.php',

    // Slider block
    'src/slider/index.js',
    'src/slider/frontend.js',
    'src/slider/block.json',
    'src/slider/render.php',
    'src/slider/editor.css',
    'src/slider/frontend.css',

    // Frame block
    'src/frame/index.js',
    'src/frame/block.json',
    'src/frame/render.php',
    'src/frame/editor.css',

    // Includes
    'includes/class-fsc-admin.php',
    'includes/class-fsc-assets.php',
    'includes/class-fsc-post-loader.php',
    'includes/class-fsc-theme-integration.php',
    'includes/class-fsc-utilities.php',

    // Configuration files
    'webpack.config.js',
    'package.json',
    'package-lock.json',
    '.gitattributes',
    '.gitignore',

    // Documentation
    'README.md',
    'DEVELOPMENT_GUIDELINES.md'
];

// Create backups directory if it doesn't exist
const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Create timestamped backup directory
const timestampedBackupDir = path.join(backupDir, timestamp);
fs.mkdirSync(timestampedBackupDir, { recursive: true });

console.log(`Creating backup: ${timestamp}`);

// Copy files to backup
filesToBackup.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    const destPath = path.join(timestampedBackupDir, file);

    // Create directory structure if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✓ Backed up: ${file}`);
    } else {
        console.log(`⚠ File not found: ${file}`);
    }
});

console.log(`\nBackup completed: ${timestampedBackupDir}`);
console.log('To restore: copy files from backup directory back to their original locations');
