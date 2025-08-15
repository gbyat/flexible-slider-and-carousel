const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read version from package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageData.version;

console.log(`🚀 Creating release v${version}...`);

try {
    // Force add build directory (even if it's in .gitignore)
    console.log('📦 Adding build directory to git...');
    execSync('git add -f blocks/', { stdio: 'inherit' });

    // Add all other changes
    console.log('📦 Adding other files to git...');
    execSync('git add .', { stdio: 'inherit' });

    // Commit with version
    console.log('💾 Committing changes...');
    execSync(`git commit -m "Release v${version}"`, { stdio: 'inherit' });

    // Delete existing tag if it exists
    try {
        console.log('🗑️ Removing existing tag if it exists...');
        execSync(`git tag -d v${version}`, { stdio: 'pipe' });
        execSync(`git push origin :refs/tags/v${version}`, { stdio: 'pipe' });
    } catch (e) {
        // Tag doesn't exist, that's fine
    }

    // Create annotated tag
    console.log('🏷️ Creating tag...');
    execSync(`git tag -a "v${version}" -m "Release v${version}"`, { stdio: 'inherit' });

    // Push to GitHub
    console.log('⬆️ Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    execSync(`git push origin v${version}`, { stdio: 'inherit' });

    console.log(`✅ Release v${version} successfully created and pushed to GitHub!`);
    console.log('🎉 GitHub Actions will now create the release automatically.');

} catch (error) {
    console.error('❌ Error during release:', error.message);
    process.exit(1);
}
