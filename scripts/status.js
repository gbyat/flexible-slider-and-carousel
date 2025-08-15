const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read version from package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageData.version;

console.log('📊 Plugin Status Report');
console.log('========================');
console.log(`🏷️  Current Version: v${version}`);
console.log('');

try {
    // Get git status
    console.log('📋 Git Status:');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim()) {
        console.log(gitStatus);
    } else {
        console.log('✅ Working tree is clean');
    }
    
    console.log('');
    
    // Get last commit
    console.log('📝 Last Commit:');
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
    console.log(lastCommit.trim());
    
    console.log('');
    
    // Get current branch
    console.log('🌿 Current Branch:');
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' });
    console.log(currentBranch.trim());
    
    console.log('');
    
    // Get remote info
    console.log('🌐 Remote Info:');
    try {
        const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' });
        console.log(`Origin: ${remoteUrl.trim()}`);
    } catch (e) {
        console.log('❌ No remote origin configured');
    }
    
} catch (error) {
    console.error('❌ Error getting git status:', error.message);
}
